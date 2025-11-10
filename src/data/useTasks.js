// src/data/useTasks.js
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const ALLOWED_KEYS = [
  "title",
  "description",
  "type",
  "status",
  "start_date",
  "due_date",
  "priority",
  "tags",
  "recurrence",
  "completed_at",
]

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let ignore = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (!ignore) {
        if (error) console.error(error)
        setTasks(data || [])
        setLoading(false)
      }
    }
    load()

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        (payload) => {
          setTasks((prev) => {
            const row = payload.new ?? payload.old
            if (payload.eventType === "INSERT") return [payload.new, ...prev]
            if (payload.eventType === "UPDATE") return prev.map(t => t.id === row.id ? payload.new : t)
            if (payload.eventType === "DELETE") return prev.filter(t => t.id !== row.id)
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  function pickAllowed(updates) {
    const result = {}
    for (const k of ALLOWED_KEYS) {
      if (updates[k] !== undefined) result[k] = updates[k]
    }
    return result
  }

  async function addTask(input) {
  const nowISO = new Date().toISOString().slice(0, 10)
  const payload = {
    title: (input.title || "").trim(),
    description: (input.description || "").trim(),
    type: (input.type || "daily").toLowerCase(),
    status: (input.status || "pending").toLowerCase(),
    start_date: input.start_date || nowISO,
    due_date: input.due_date || null,
    priority: (input.priority || "medium").toLowerCase(),    
    completed_at: input.completed_at || null, 
    // 🔥 Removed priority, tags, recurrence — not in DB
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single()

  if (error) {
    console.error(error)
    throw error
  }

  setTasks((prev) => [data, ...prev])
  return data
  }

  async function patchTask(id, updates) {
    const payload = pickAllowed({
      ...updates,
      // keep values canonical
      type: updates.type ? String(updates.type).toLowerCase() : undefined,
      status: updates.status ? String(updates.status).toLowerCase() : undefined,
      priority: updates.priority ? String(updates.priority).toLowerCase() : undefined, 
    })

    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error(error)
      throw error
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
    return data
  }

  async function removeTask(id) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      throw error
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function toggleStatus(id) {
    const row = tasks.find((t) => t.id === id)
    if (!row) return
    const next =
      row.status === "completed" ? "pending" :
      row.status === "pending" ? "in-progress" :
      "completed"
    return patchTask(id, { status: next })
  }

  return { tasks, loading, addTask, removeTask, patchTask, toggleStatus }
}
