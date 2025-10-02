// src/components/DashboardStats.jsx
export default function DashboardStats({ tasks = [], loading }) {
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

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const toDate = (iso) => {
    if (!iso) return null
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const isSameYMD = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length

  const dueToday = tasks.filter((t) => {
    const d = toDate(t.due_date)
    return d && isSameYMD(d, today)
  }).length

  const overdue = tasks.filter((t) => {
    const d = toDate(t.due_date)
    if (!d) return false
    return d < startOfToday && t.status !== 'completed'
  }).length

  const completionRate = total ? Math.round((completed / total) * 100) : 0

  const upcoming = [...tasks]
    .filter((t) => t.due_date && t.status !== 'completed')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  return (
    <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 backdrop-blur dark:bg-gray-900/75 dark:ring-white/10">
      <h2 className="text-lg font-semibold mb-4">Overview</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Total" value={total} />
        <KPI label="Completed" value={completed} accent="text-emerald-600" />
        <KPI label="In Progress" value={inProgress} accent="text-amber-600" />
        <KPI label="Pending" value={pending} accent="text-gray-700 dark:text-gray-200" />
      </div>

      {/* Completion progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Completion</div>
          <div className="text-sm font-semibold">{completionRate}%</div>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-[width]"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Today & Overdue */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatPill title="Due Today" value={dueToday} />
        <StatPill title="Overdue" value={overdue} tone={overdue ? 'bad' : 'ok'} />
      </div>

      {/* Upcoming tasks */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Upcoming</h3>
        {upcoming.length === 0 ? (
          <div className="text-sm opacity-70">No upcoming tasks.</div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/90 dark:bg-gray-800/80"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs opacity-70">
                    Due{' '}
                    {new Date(t.due_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {t.type || 'task'}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide bg-indigo-50 text-indigo-700">
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function KPI({ label, value, accent }) {
  return (
    <div className="p-4 rounded-2xl bg-white/90 dark:bg-gray-800/80 ring-1 ring-black/5 dark:ring-white/10">
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${accent || ''}`}>{value}</div>
    </div>
  )
}

function StatPill({ title, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'bad'
      ? 'bg-rose-50 text-rose-700'
      : tone === 'ok'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
  return (
    <div className={`p-4 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 ${toneClass}`}>
      <div className="text-xs uppercase tracking-wide opacity-70">{title}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  )
}
