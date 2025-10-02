// src/components/ReportsView.jsx
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts"

export default function ReportsView({ tasks = [], loading }) {
  if (loading) {
    return (
      <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse" />
        <div className="h-[220px] w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  // --- helpers (timezone-safe date parsing)
  const parseLocalDate = (iso) => {
    if (!iso) return null
    const [y, m, d] = iso.split("-").map(Number)
    return new Date(y, m - 1, d)
  }

  // status breakdown (for the donut)
  const statusCounts = tasks.reduce(
    (acc, t) => {
      acc[t.status || "pending"]++
      return acc
    },
    { completed: 0, "in-progress": 0, pending: 0 }
  )
  const donutData = [
    { name: "Completed", value: statusCounts.completed, key: "completed", color: "#10b981" },
    { name: "In progress", value: statusCounts["in-progress"], key: "in-progress", color: "#f59e0b" },
    { name: "Pending", value: statusCounts.pending, key: "pending", color: "#6b7280" },
  ]

  // last 12 weeks (Mon–Sun) -> completed per week
  const startOfWeek = (d) => {
    const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const day = copy.getDay() // 0 Sun … 6 Sat
    const diff = (day + 6) % 7 // shift so Monday is start
    copy.setDate(copy.getDate() - diff)
    copy.setHours(0, 0, 0, 0)
    return copy
  }

  const endOfWeek = (d) => {
    const s = startOfWeek(d)
    const e = new Date(s)
    e.setDate(s.getDate() + 6)
    e.setHours(23, 59, 59, 999)
    return e
  }

  const today = new Date()
  const weeks = []
  for (let i = 11; i >= 0; i--) {
    const ref = new Date(today)
    ref.setDate(ref.getDate() - i * 7)
    const s = startOfWeek(ref)
    const e = endOfWeek(ref)
    const label = `${s.getMonth() + 1}/${s.getDate()}`
    weeks.push({ s, e, label })
  }

  const weeklyData = weeks.map(({ s, e, label }) => {
    const completed = tasks.filter((t) => {
      const d = parseLocalDate(t.due_date)
      return d && t.status === "completed" && d >= s && d <= e
    }).length
    const created = tasks.filter((t) => {
      const d = parseLocalDate(t.start_date || t.created_at?.slice(0, 10))
      return d && d >= s && d <= e
    }).length
    return { label, completed, created }
  })

  // month totals for current year
  const thisYear = today.getFullYear()
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(thisYear, i, 1).toLocaleString("default", { month: "short" })
  )

  const monthly = Array.from({ length: 12 }, (_, i) => ({ m: monthNames[i], completed: 0 }))
  tasks.forEach((t) => {
    const d = parseLocalDate(t.due_date)
    if (d && d.getFullYear() === thisYear && t.status === "completed") {
      monthly[d.getMonth()].completed++
    }
  })

  return (
    <div className="space-y-6">
      {/* row: donut + KPIs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
          <h3 className="text-sm font-semibold mb-3">Status breakdown</h3>
          <div className="h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={2}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 text-sm">
            {donutData.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: d.color }} />
                <span className="opacity-80">{d.name}</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <KPICard label="Total tasks" value={tasks.length} />
          <KPICard label="Completed" value={statusCounts.completed} accent="text-emerald-600" />
          <KPICard label="In progress" value={statusCounts['in-progress']} accent="text-amber-600" />
          <KPICard label="Pending" value={statusCounts.pending} />
        </div>
      </div>

      {/* Weekly bar: created vs completed */}
      <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
        <h3 className="text-sm font-semibold mb-3">Last 12 weeks</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={weeklyData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="created" stackId="a" fill="#6366f1" />
              <Bar dataKey="completed" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly totals (this year) */}
      <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
        <h3 className="text-sm font-semibold mb-3">Completed per month ({thisYear})</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={monthly} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="m" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, accent }) {
  return (
    <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${accent || ""}`}>{value}</div>
    </div>
  )
}
