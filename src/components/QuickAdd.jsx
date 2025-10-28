// src/components/QuickAdd.jsx
import { useState } from "react"

const TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

export default function QuickAdd({ onAdd }) {
  const today = new Date().toISOString().slice(0, 10)
  const [title, setTitle] = useState("")
  const [type, setType] = useState("daily")
  const [dueDate, setDueDate] = useState(today)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  async function submit() {
    setErr("")
    if (!title.trim()) {
      setErr("Please enter a title.")
      return
    }
    setBusy(true)
    try {
      await onAdd?.({
        title: title.trim(),
        description: "",
        type,                            // already canonical lowercase
        status: "pending",
        start_date: today,               // ✅ always provide start_date
        due_date: dueDate || null,
      })
      setTitle("")
      setDueDate(today)
      setType("daily")
    } catch (e) {
      setErr(e?.message || "Could not add task.")
    } finally {
      setBusy(false)
    }
  }

  function onKey(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3">
      <input
        className="flex-1 px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKey}
      />
      <select
        className="px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <input
        type="date"
        className="px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button
        className="px-4 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
        disabled={busy}
        onClick={submit}
      >
        {busy ? "Adding…" : "Add"}
      </button>
      {err && <div className="text-sm text-rose-600 mt-1 sm:ml-2">{err}</div>}
    </div>
  )
}
