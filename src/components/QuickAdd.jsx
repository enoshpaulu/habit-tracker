import { useState } from 'react'

const TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function QuickAdd({ onAdd }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('daily')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))

  function handleAdd(e) {
    e.preventDefault() // ⬅️ prevents page reload
    if (!title.trim()) return
    onAdd?.({
      title,
      type,
      due_date: dueDate,
      status: 'pending',
      description: '',
    })
    setTitle('')
  }

  return (
    <form
      onSubmit={handleAdd}
      className="flex flex-col sm:flex-row gap-3"
    >
      <input
        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 placeholder-gray-400
                   dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2
                   focus:ring-indigo-500"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Dropdown with custom arrow */}
      <div className="relative">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 text-sm font-medium bg-white
                     dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500 text-xs">
          ▼
        </span>
      </div>

      <input
        type="date"
        className="px-3 py-2.5 rounded-xl border border-gray-300
                   dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <button
        type="submit"
        className="px-4 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700
                   active:scale-[0.98] shadow-md transition"
      >
        Add
      </button>
    </form>
  )
}
