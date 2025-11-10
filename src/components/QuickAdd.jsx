// src/components/QuickAdd.jsx
import { useState } from "react"

const TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "one-time", label: "One-time" },       // NEW
]

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export default function QuickAdd({ onAdd }) {
  const today = new Date().toISOString().slice(0,10)
  const [title, setTitle] = useState("")
  const [type, setType] = useState("daily")
  const [priority, setPriority] = useState("medium")       // NEW
  const [dueDate, setDueDate] = useState(today)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  async function submit() {
    if (busy) return
    setErr("")
    if (!title.trim()) { setErr("Please enter a title."); return }

    setBusy(true)
    try {
      await onAdd?.({
        title: title.trim(),
        description: "",
        type,                          // already lowercase
        priority,                      // NEW
        status: "pending",
        start_date: today,
        due_date: dueDate || null,
      })
      setTitle(""); setType("daily"); setPriority("medium"); setDueDate(today)
    } catch (e) {
      setErr(e?.message || "Could not add task.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="flex flex-col sm:flex-row items-stretch gap-3"
          onSubmit={(e)=>{e.preventDefault(); submit();}}>
      <input
        className="flex-1 px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
        placeholder="Task title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />
      <select
        className="px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
        value={type}
        onChange={(e)=>setType(e.target.value)}
      >
        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select
        className="px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
        value={priority}
        onChange={(e)=>setPriority(e.target.value)}
      >
        {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <input
        type="date"
        className="px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
        value={dueDate}
        onChange={(e)=>setDueDate(e.target.value)}
      />
      <button type="submit"
        className={`px-4 py-2.5 rounded-xl font-semibold text-white ${busy ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
        {busy ? "Adding…" : "Add"}
      </button>
      {err && <div className="text-sm text-rose-600 self-center">{err}</div>}
    </form>
  )
}
