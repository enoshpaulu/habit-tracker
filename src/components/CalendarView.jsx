// src/components/CalendarView.jsx
import React from "react"

export default function CalendarView({
  month,       // 0..11
  year,        // e.g. 2025
  tasks = [],
  onToggle,
  onEdit,
  onDelete,
  onCreate,    // (iso) => void
  onMove,      // ✅ (taskId, newDateISO) => void  <-- NEW
}) {
  // Weekday for the 1st (0=Sun..6=Sat) and number of days in month
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Group tasks by day number
  const byDay = tasks.reduce((acc, t) => {
    if (!t.due_date) return acc
    const d = parseLocalDate(t.due_date)
    const day = d?.getDate()
    if (!day) return acc
    ;(acc[day] ||= []).push(t)
    return acc
  }, {})

  // Styles
  const chipClass = (status) =>
    status === "completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "in-progress"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-gray-100 text-gray-700 border-gray-200"

  // Build cells: leading blanks then 1..daysInMonth
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-gray-900/70">
      {/* Week headers */}
      <div className="grid grid-cols-7 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200/70 dark:border-gray-800">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((w) => (
          <div key={w} className="px-3 py-2 text-center">{w}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-gray-200/60 dark:bg-gray-800/80">
        {cells.map((dayNum, idx) => {
          const dayTasks = dayNum ? (byDay[dayNum] || []) : []
          const visible = dayTasks.slice(0, 3)
          const hidden = Math.max(0, dayTasks.length - visible.length)

          const isoForCell = dayNum
            ? `${String(year)}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
            : null

          return (
            <div
              key={idx}
              className="min-h-[120px] bg-white dark:bg-gray-900 p-2 flex flex-col gap-2"
              // ✅ Drop target handlers
              onDragOver={(e) => {
                if (!isoForCell || !onMove) return
                e.preventDefault() // allow drop
              }}
              onDrop={(e) => {
                if (!isoForCell || !onMove) return
                const taskId = e.dataTransfer.getData("text/task-id")
                if (taskId) onMove(taskId, isoForCell)
              }}
            >
              {/* Day header with + */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {dayNum ?? ""}
                </div>
                {dayNum && onCreate && (
                  <button
                    onClick={() => onCreate(isoForCell)}
                    className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    title="Add task for this day"
                  >
                    +
                  </button>
                )}
              </div>

              {/* Tasks list (chips are drag sources) */}
              <div className="flex-1 space-y-1">
                {visible.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded-lg border ${chipClass(t.status)}`}
                    title={t.title}
                    draggable // ✅ make it draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/task-id", t.id)
                      // optional: customize drag preview
                      // e.dataTransfer.setDragImage(new Image(), 0, 0)
                    }}
                  >
                    <button
                      className="shrink-0 w-4 h-4 rounded-full border border-current flex items-center justify-center"
                      onClick={() => onToggle?.(t.id)}
                      aria-label="Toggle status"
                    >
                      {t.status === "completed" ? "✓" : ""}
                    </button>

                    <button
                      onClick={() => onEdit?.(t)}
                      className="min-w-0 text-xs font-medium truncate text-left"
                    >
                      {t.title}
                    </button>

                    <button
                      onClick={() => onDelete?.(t.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
                      aria-label="Delete"
                    >
                      Del
                    </button>
                  </div>
                ))}

                {hidden > 0 && (
                  <div className="text-[10px] text-gray-600 dark:text-gray-300">+{hidden} more…</div>
                )}

                {dayNum && dayTasks.length === 0 && (
                  <div className="text-[11px] text-gray-400 dark:text-gray-500">No tasks</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Local date parser to avoid TZ shifts on YYYY-MM-DD
function parseLocalDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}
