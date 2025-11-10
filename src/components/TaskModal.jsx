
import { useEffect, useState } from "react"

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
]

const TYPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "one-time", label: "One-time" },   // NEW
]

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export default function TaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("daily")
  const [status, setStatus] = useState("pending")
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("medium")     // NEW
  const [completedAt, setCompletedAt] = useState("")     // NEW

  const toISODate = (v) => {
    if (!v) return ""
    const d = new Date(v)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  useEffect(() => {
    if (!task) return
    setTitle(task.title ?? "")
    setDescription(task.description ?? "")
    setType((task.type || "daily").toLowerCase())
    const s = (task.status || "pending").toLowerCase()
    setStatus(["pending","in-progress","completed"].includes(s) ? s : "pending")
    setStartDate(toISODate(task.start_date))
    setDueDate(toISODate(task.due_date))
    setPriority((task.priority || "medium").toLowerCase())  // NEW
    setCompletedAt(toISODate(task.completed_at))            // NEW
  }, [task])

  function handleStatusChange(next) {
    setStatus(next)
    // convenience: if user marks Completed and no completion date, set today.
    if (next === "completed" && !completedAt) {
      const t = new Date()
      setCompletedAt(toISODate(t.toISOString()))
    }
    if (next !== "completed") {
      setCompletedAt("")   // keep consistent: only completed items have a completion date
    }
  }

  function handleSave() {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      start_date: startDate || null,
      due_date: dueDate || null,
      priority,                                      // NEW
      completed_at: status === "completed"
        ? (completedAt || toISODate(new Date().toISOString()))
        : null,                                      // NEW
    }
    onSave?.(payload)
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10">
        <h2 className="text-xl font-semibold mb-4">Edit task</h2>

        <label className="block text-sm font-medium mb-1">Title</label>
        <input className="w-full mb-3 rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white dark:bg-gray-800 dark:ring-white/10"
               value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Task title" />

        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea className="w-full mb-3 rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white dark:bg-gray-800 dark:ring-white/10"
                  rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Notes, links, etc." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="w-full rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white dark:bg-gray-800 dark:ring-white/10"
                    value={type} onChange={(e)=>setType(e.target.value)}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="w-full rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white dark:bg-gray-800 dark:ring-white/10"
                    value={status} onChange={(e)=>handleStatusChange(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start date</label>
            <input type="date" className="w-full rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white dark:bg-gray-800 dark:ring-white/10"
                   value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due date</label>
            <input type="date" className="w-full rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white dark:bg-gray-800 dark:ring-white/10"
                   value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select className="w-full rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white dark:bg-gray-800 dark:ring-white/10"
                    value={priority} onChange={(e)=>setPriority(e.target.value)}>
              {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Completion date</label>
            <input type="date" disabled={status !== "completed"}     // only meaningful when completed
                   className="w-full rounded-xl border-0 ring-1 ring-black/10 px-3 py-2 bg-white disabled:opacity-60 dark:bg-gray-800 dark:ring-white/10"
                   value={completedAt} onChange={(e)=>setCompletedAt(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-xl ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
