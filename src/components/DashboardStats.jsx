// src/components/DashboardStats.jsx
import { useMemo, useState } from "react"

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

export default function DashboardStats({ tasks = [], loading }) {
  const [selectedStatus, setSelectedStatus] = useState("all") // 'all' | 'completed' | 'in-progress' | 'pending'
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  if (loading) {
    return (
      <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white/90 dark:bg-gray-800/80 ring-1 ring-black/5 dark:ring-white/10"
            >
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- counts for KPI cards
  const total = tasks.length
  const completed = tasks.filter(t => (t.status || "").toLowerCase() === "completed").length
  const inProgress = tasks.filter(t => (t.status || "").toLowerCase() === "in-progress").length
  const pending = tasks.filter(t => (t.status || "").toLowerCase() === "pending").length

  // --- derived filtered list
  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        const s = (t.status || "").toLowerCase()
        const p = (t.priority || "medium").toLowerCase()
        const ty = (t.type || "daily").toLowerCase()
        const sOk = selectedStatus === "all" || s === selectedStatus
        const pOk = selectedPriority === "all" || p === selectedPriority
        const tOk = selectedType === "all" || ty === selectedType
        return sOk && pOk && tOk
      })
      .sort((a, b) => {
        // sort by relevant date based on status selection
        if (selectedStatus === "completed") {
          const ad = new Date(a.completed_at || a.due_date || a.start_date || 0).getTime()
          const bd = new Date(b.completed_at || b.due_date || b.start_date || 0).getTime()
          return bd - ad // newest completed first
        }
        if (selectedStatus === "pending" || selectedStatus === "in-progress") {
          const ad = new Date(a.due_date || a.start_date || 0).getTime()
          const bd = new Date(b.due_date || b.start_date || 0).getTime()
          return ad - bd // nearest due first
        }
        // "all" — keep recent created_at first if present
        const ad = new Date(a.created_at || a.due_date || a.start_date || 0).getTime()
        const bd = new Date(b.created_at || b.due_date || b.start_date || 0).getTime()
        return bd - ad
      })
  }, [tasks, selectedStatus, selectedPriority, selectedType])

  function toggleStatus(status) {
    setSelectedStatus(prev => (prev === status ? "all" : status))
  }

  const showList = selectedStatus !== "all"
  const listTitle =
    selectedStatus === "completed"
      ? "Completed tasks"
      : selectedStatus === "in-progress"
      ? "In-progress tasks"
      : selectedStatus === "pending"
      ? "Pending tasks"
      : "Tasks"

  return (
    <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 backdrop-blur dark:bg-gray-900/75 dark:ring-white/10">
      <h2 className="text-lg font-semibold mb-4">Overview</h2>

      {/* KPI row (clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI
          label="Total"
          value={total}
          active={selectedStatus === "all"}
          onClick={() => setSelectedStatus("all")}
        />
        <KPI
          label="Completed"
          value={completed}
          accent="text-emerald-600"
          active={selectedStatus === "completed"}
          onClick={() => toggleStatus("completed")}
        />
        <KPI
          label="In-Progress"
          value={inProgress}
          accent="text-amber-600"
          active={selectedStatus === "in-progress"}
          onClick={() => toggleStatus("in-progress")}
        />
        <KPI
          label="Pending"
          value={pending}
          accent="text-gray-700 dark:text-gray-200"
          active={selectedStatus === "pending"}
          onClick={() => toggleStatus("pending")}
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <select
          className="px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          {PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className="px-3 py-2.5 rounded-xl border-0 ring-1 ring-black/10 bg-white dark:bg-gray-800 dark:ring-white/10"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {(selectedStatus !== "all" || selectedPriority !== "all" || selectedType !== "all") && (
          <button
            className="px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-900"
            onClick={() => { setSelectedStatus("all"); setSelectedPriority("all"); setSelectedType("all"); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Task list */}
      <div className="mt-5">
        {showList ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">{listTitle}</h3>
              <div className="text-xs opacity-70">{filtered.length} item(s)</div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-sm opacity-70">No tasks match your filters.</div>
            ) : (
              <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/90 dark:bg-gray-800/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left opacity-70">
                      <th className="px-4 py-2">Task</th>
                      <th className="px-4 py-2">
                        {selectedStatus === "completed" ? "Completed" : "Due"}
                      </th>
                      <th className="px-4 py-2">Priority</th>
                      <th className="px-4 py-2 hidden sm:table-cell">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} className="border-t border-black/5 dark:border-white/10">
                        <td className="px-4 py-2">
                          <div className="font-medium truncate">{t.title}</div>
                          {!!t.description && (
                            <div className="text-xs opacity-70 truncate">{t.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {formatDate(
                            selectedStatus === "completed"
                              ? t.completed_at || t.due_date || t.start_date
                              : t.due_date || t.start_date
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <PriorityChip value={(t.priority || "medium").toLowerCase()} />
                        </td>
                        <td className="px-4 py-2 hidden sm:table-cell capitalize">
                          {(t.type || "daily").replace("-", " ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm opacity-70">
            Pick a status above (Completed / In-Progress / Pending) to see a focused list.  
            Use Priority and Task Type to refine the results.
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- helpers & small components ---------- */

function formatDate(v) {
  if (!v) return "—"
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function KPI({ label, value, accent, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "text-left p-4 rounded-2xl transition shadow-sm " +
        (active
          ? "bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:ring-indigo-900"
          : "bg-white/90 ring-1 ring-black/5 hover:bg-white dark:bg-gray-800/80 dark:ring-white/10")
      }
    >
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
