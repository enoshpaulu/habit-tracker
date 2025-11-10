// src/components/DashboardStats.jsx
import { useState, useMemo } from "react"

export default function DashboardStats({ tasks = [], loading }) {
  // All hooks first
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  // Helpers
  const PRIORITY_OPTIONS = [
    { value: "all", label: "All priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ]

  const TYPE_OPTIONS = [
    { value: "all", label: "All types" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "one-time", label: "One-time" },
  ]

  // Safe date helper
  const timeOr = (v, fallback = 0) => {
    if (!v) return fallback
    const t = new Date(v).getTime()
    return Number.isNaN(t) ? fallback : t
  }

  // Compute filtered list
  const filtered = useMemo(() => {
    const list = (Array.isArray(tasks) ? tasks : []).filter(t => {
      const s = (t?.status || "").toLowerCase()
      const p = (t?.priority || "medium").toLowerCase()
      const ty = (t?.type || "daily").toLowerCase()
      const sOk = selectedStatus === "all" || s === selectedStatus
      const pOk = selectedPriority === "all" || p === selectedPriority
      const tOk = selectedType === "all" || ty === selectedType
      return sOk && pOk && tOk
    })
    return [...list].sort(
      (a, b) =>
        timeOr(b?.completed_at || b?.due_date || b?.created_at) -
        timeOr(a?.completed_at || a?.due_date || a?.created_at)
    )
  }, [tasks, selectedStatus, selectedPriority, selectedType])

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>
  }

  const total = tasks.length
  const completed = tasks.filter(t => (t?.status || "").toLowerCase() === "completed").length
  const inProgress = tasks.filter(t => (t?.status || "").toLowerCase() === "in-progress").length
  const pending = tasks.filter(t => (t?.status || "").toLowerCase() === "pending").length

  function toggleStatus(status) {
    setSelectedStatus(prev => (prev === status ? "all" : status))
  }

  const showList = selectedStatus !== "all"

  return (
    <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
      <h2 className="text-lg font-semibold mb-4">Overview</h2>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Total" value={total} active={selectedStatus === "all"} onClick={() => setSelectedStatus("all")} />
        <KPI label="Completed" value={completed} accent="text-emerald-600" active={selectedStatus === "completed"} onClick={() => toggleStatus("completed")} />
        <KPI label="In Progress" value={inProgress} accent="text-amber-600" active={selectedStatus === "in-progress"} onClick={() => toggleStatus("in-progress")} />
        <KPI label="Pending" value={pending} active={selectedStatus === "pending"} onClick={() => toggleStatus("pending")} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-black/10" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
          {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-black/10" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {(selectedStatus !== "all" || selectedPriority !== "all" || selectedType !== "all") && (
          <button onClick={() => { setSelectedStatus("all"); setSelectedPriority("all"); setSelectedType("all"); }}
            className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
            Clear filters
          </button>
        )}
      </div>

      {/* Task list */}
      {showList ? (
        <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/90 dark:bg-gray-800/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="px-4 py-2">Task</th>
                <th className="px-4 py-2">{selectedStatus === "completed" ? "Completed" : "Due"}</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2 hidden sm:table-cell">Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-4 py-2">
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="text-xs opacity-70">{t.description}</div>}
                  </td>
                  <td className="px-4 py-2">{formatDate(selectedStatus === "completed" ? t.completed_at : t.due_date)}</td>
                  <td className="px-4 py-2"><PriorityChip value={(t.priority || "medium").toLowerCase()} /></td>
                  <td className="px-4 py-2 hidden sm:table-cell capitalize">{(t.type || "daily").replace("-", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm opacity-70">Select a status above to view tasks.</div>
      )}
    </div>
  )
}

function formatDate(v) {
  if (!v) return "—"
  const t = new Date(v).getTime()
  if (Number.isNaN(t)) return "—"
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function KPI({ label, value, accent, active, onClick }) {
  return (
    <button onClick={onClick} className={
      "p-4 rounded-2xl text-left shadow-sm transition " +
      (active
        ? "bg-indigo-50 ring-1 ring-indigo-200"
        : "bg-white/90 ring-1 ring-black/5 hover:bg-white dark:bg-gray-800/80 dark:ring-white/10")
    }>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${accent || ""}`}>{value}</div>
    </button>
  )
}

function PriorityChip({ value }) {
  const cls =
    value === "high"
      ? "bg-rose-50 text-rose-700"
      : value === "low"
      ? "bg-sky-50 text-sky-700"
      : "bg-amber-50 text-amber-700"
  return (
    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>
      {value}
    </span>
  )
}
