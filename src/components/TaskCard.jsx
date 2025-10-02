// src/components/TaskCard.jsx
export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  // Accent is indigo to match the rest of the UI
  const typeBadge =
    task.type === 'daily'
      ? 'bg-blue-50 text-blue-700'
      : task.type === 'weekly'
      ? 'bg-violet-50 text-violet-700'
      : 'bg-amber-50 text-amber-800'

  const statusBadge =
    task.status === 'completed'
      ? 'bg-emerald-50 text-emerald-700'
      : task.status === 'in-progress'
      ? 'bg-yellow-50 text-yellow-800'
      : 'bg-gray-100 text-gray-700'

  return (
    <div className="p-4 sm:p-5 rounded-2xl shadow-md ring-1 ring-black/5 bg-white/95 backdrop-blur
                    hover:shadow-lg hover:-translate-y-[1px] transition-transform
                    dark:bg-gray-900/85 dark:ring-white/10">
      <div className="flex items-start justify-between gap-3">
        {/* Left: checkbox + text */}
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={onToggle}
            aria-label="Toggle status"
            title="Toggle status"
            className={`mt-1 w-5 h-5 rounded-md ring-1 ring-black/10 dark:ring-white/10 flex items-center justify-center
              ${task.status === 'completed' ? 'bg-emerald-600 ring-emerald-600' : 'bg-white dark:bg-gray-800'}`}
          >
            {task.status === 'completed' && <span className="text-white text-[11px] leading-none">✓</span>}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold truncate">{task.title}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${typeBadge}`}>
                {task.type}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${statusBadge}`}>
                {task.status}
              </span>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
                {task.description}
              </p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Start: {task.start_date ?? '—'} · Due: {task.due_date ?? '—'}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-md
                       hover:bg-indigo-700 active:scale-[0.98] transition"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-xl text-sm font-medium bg-rose-600 text-white shadow-md
                       hover:bg-rose-700 active:scale-[0.98] transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
