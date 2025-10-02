import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTasks } from '../data/useTasks'
import QuickAdd from '../components/QuickAdd'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import DashboardStats from '../components/DashboardStats'
import CalendarView from '../components/CalendarView'
import ReportsView from '../components/ReportsView'
import SettingsView from '../components/SettingsView'

const TABS = ['Dashboard', 'Tasks', 'Calendar', 'Reports', 'Settings']

export default function ProgressShell({ user }) {
  const [active, setActive] = useState('Dashboard')
  const [themeDark, setThemeDark] = useState(false)
  const { tasks, loading, addTask, removeTask, toggleStatus, patchTask } = useTasks(user.id)
  const [editing, setEditing] = useState(null) // null or the task object
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const currentYear = new Date().getFullYear()
  const monthTasks = tasks.filter(t => {
    if (!t.due_date) return false
    const d = new Date(t.due_date)
    return d.getMonth() === selectedMonth && d.getFullYear() === currentYear
  })

  return (
    <div
      className={`min-h-screen px-4 py-6 sm:px-6 bg-gradient-to-b ${
        themeDark
          ? 'from-gray-950 via-gray-900 to-gray-900 text-black'
          : 'from-slate-50 via-white to-indigo-50 text-gray-900'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="rounded-3xl p-5 sm:p-6 shadow-md ring-1 ring-black/5 backdrop-blur bg-white/80
                          dark:bg-gray-900/70 dark:ring-white/10">
            {/* Top row */}
            <div className="flex justify-end gap-3">
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={themeDark}
                  onChange={(e) => setThemeDark(e.target.checked)}
                />
                <span className={`w-10 h-6 rounded-full p-1 transition ${themeDark ? "bg-indigo-600" : "bg-gray-300"}`}>
                  <span className={`block w-4 h-4 bg-white rounded-full transition ${themeDark ? "translate-x-4" : ""}`} />
                </span>
                <span className="ml-2 text-sm opacity-80">Dark</span>
              </label>

              <button
                className="px-3 py-2 rounded-xl bg-rose-600 text-white"
                onClick={() => supabase.auth.signOut()}
              >
                Sign out
              </button>
            </div>

            {/* Title */}
            <div className="mt-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Progress Tracker</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                Plan goals • Track progress • Stay consistent
              </p>
            </div>

            {/* Tabs */}
            <nav className="mt-6 flex gap-2 flex-wrap justify-center bg-gray-100/70 dark:bg-gray-800/60 p-1.5 rounded-2xl">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={
                    "min-w-[86px] px-3.5 py-2.5 rounded-xl text-sm font-semibold transition " +
                    (active === tab
                      ? "bg-white text-indigo-600 ring-1 ring-indigo-200/70 shadow-sm dark:bg-gray-900 dark:text-indigo-400 dark:ring-indigo-900/50"
                      : "text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-900/50")
                  }
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="space-y-4">
          {active === 'Dashboard' && (
            <DashboardStats tasks={tasks} loading={loading} />
          )}

          {active === 'Tasks' && (
            <div className="space-y-3">
              <div className="p-4 sm:p-5 rounded-3xl shadow-md ring-1 ring-black/5 backdrop-blur bg-white/90 dark:bg-gray-900/70 dark:ring-white/10">
                <h2 className="text-base sm:text-lg font-semibold mb-3">Tasks</h2>
                <QuickAdd onAdd={addTask} />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {loading && <div className="p-4 text-center text-sm opacity-70">Loading tasks...</div>}

                {!loading && tasks.length === 0 && (
                  <div className="p-4 sm:p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/90 dark:bg-gray-900/70 dark:ring-white/10 text-center">
                    <p className="text-sm opacity-80">No tasks yet. Add your first task above.</p>
                  </div>
                )}

                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => toggleStatus(task.id)}
                    onEdit={() => setEditing(task)}   // ✅ Opens modal
                    onDelete={() => removeTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {active === 'Calendar' && (
            <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10">
              <h2 className="text-lg font-semibold mb-4 text-center">Calendar</h2>

              {/* Month Selector */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMonth(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                      ${selectedMonth === i 
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                      }`}
                  >
                    {new Date(currentYear, i).toLocaleString("default", { month: "short" })}
                  </button>
                ))}
              </div>

              {/* Calendar Grid */}
              <CalendarView
                month={selectedMonth}
                year={currentYear}
                tasks={monthTasks}
                onToggle={toggleStatus}
                onEdit={setEditing}   // ✅ Opens modal
                onDelete={removeTask}
              />
            </div>
          )}

          {active === 'Reports' && (
            <ReportsView tasks={tasks} loading={loading} />
          )}

          {active === 'Settings' && (
             <SettingsView user={user} themeDark={themeDark} setThemeDark={setThemeDark} />
          )}
        </main>
      </div>

      {/* Task Modal */}
      {editing && (
        <TaskModal
          task={editing}
          onClose={() => setEditing(null)}   // ✅ Cancel closes modal
          onSave={(updates) => {
            patchTask(editing.id, updates)
            setEditing(null)                // ✅ Close after save
          }}
        />
      )}
    </div>
  )
}
