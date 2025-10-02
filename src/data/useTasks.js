import { useEffect, useState } from 'react'
import { listTasks, insertTask, updateTask, deleteTask, subscribeTasks } from './tasks.service'

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let stop = () => {}
    async function load() {
      const { data, error } = await listTasks(userId)
      if (error) { console.error(error); setTasks([]) }
      else setTasks(data || [])
      setLoading(false)

      // realtime
      stop = subscribeTasks(userId, (payload) => {
        const row = payload.new ?? payload.old
        setTasks((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new, ...prev]
          if (payload.eventType === 'UPDATE') return prev.map(t => t.id === row.id ? payload.new : t)
          if (payload.eventType === 'DELETE') return prev.filter(t => t.id !== row.id)
          return prev
        })
      })
    }
    load()
    return () => stop()
  }, [userId])

  async function addTask(t) {
    const { data, error } = await insertTask(userId, t)
    if (error) return console.error(error)
    setTasks(prev => [data, ...prev]) // optimistic
  }

  async function patchTask(id, patch) {
    const { data, error } = await updateTask(userId, id, patch)
    if (error) return console.error(error)
    setTasks(prev => prev.map(x => x.id === id ? data : x))
  }

  async function removeTask(id) {
    const { error } = await deleteTask(userId, id)
    if (error) return console.error(error)
    setTasks(prev => prev.filter(x => x.id !== id))
  }

  function toggleStatus(id) {
    const t = tasks.find(x => x.id === id)
    if (!t) return
    const next = t.status === 'completed' ? 'pending' : t.status === 'pending' ? 'in-progress' : 'completed'
    patchTask(id, { status: next })
  }

  return { tasks, loading, addTask, patchTask, removeTask, toggleStatus }
}
