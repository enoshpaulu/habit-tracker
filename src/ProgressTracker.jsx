import React, { useEffect, useMemo, useState } from "react";

/**
 * Progress Tracker App – Single-file React MVP
 * - Task management: add / edit / delete; types: daily | weekly | monthly
 * - Progress tracking: simple progress bars for daily / weekly / monthly
 * - Calendar view: shows days with completed tasks
 * - Reports: planned vs completed by week/month
 * - Settings: email prefs (UI only), dark mode toggle
 * - Persistence: localStorage
 *
 * Styling: Tailwind CSS utility classes
 * No external UI libs required. Drop into a React project and render <ProgressTrackerApp />
 */

// ---------- Utilities ----------
const TYPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon=1 ... Sun=0
  return new Date(d.setDate(diff));
}

function endOfWeek(date) {
  const s = startOfWeek(date);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6, 23, 59, 59, 999);
}

function startOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatDateInput(date) {
  const d = new Date(date);
  if (Number.isNaN(d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseDateInput(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---------- Seed data (Initial October Targets) ----------
const SEED_TASKS = [
  { title: "Complete Genesis & Proverbs", type: "monthly" },
  { title: "Complete 1 book", type: "monthly" },
  { title: "Complete 4 hours SEO course", type: "weekly" },
  { title: "Complete 3 tutorials on video editing", type: "weekly" },
  { title: "Upload 3 blogs for Nissi Office Systems website", type: "weekly" },
  { title: "Redesign 5 pages of website", type: "monthly" },
  { title: "Create “ClicknChill” website", type: "monthly" },
  { title: "Create content calendar for “ClicknChill”", type: "monthly" },
  { title: "Successfully complete Nissi Prayers Festival", type: "monthly" },
  { title: "1 volume of Classroom of the Elite", type: "monthly" },
].map((t) => ({
  id: uid(),
  description: "",
  startDate: formatDateInput(new Date()),
  dueDate: formatDateInput(endOfMonth(new Date())),
  status: "pending",
  ...t,
}));

// ---------- Local storage ----------
const STORAGE_KEY = "progress-tracker-state-v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

// ---------- Main App ----------
export default function ProgressTrackerApp() {
  const [themeDark, setThemeDark] = useState(false);
  const [emailDaily, setEmailDaily] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [tasks, setTasks] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [editing, setEditing] = useState(null); // task id

  // Load from storage once
  useEffect(() => {
    const loaded = loadState();
    if (loaded && Array.isArray(loaded.tasks)) {
      setTasks(loaded.tasks);
      setThemeDark(!!loaded.themeDark);
      setEmailDaily(!!loaded.emailDaily);
      setEmailWeekly(!!loaded.emailWeekly);
    } else {
      // Seed if empty
      setTasks(SEED_TASKS);
    }
  }, []);

  // Persist
  useEffect(() => {
    saveState({ tasks, themeDark, emailDaily, emailWeekly });
  }, [tasks, themeDark, emailDaily, emailWeekly]);

  // Derived groups
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const weeklyRange = { from: startOfWeek(now), to: endOfWeek(now) };
  const monthlyRange = { from: startOfMonth(now), to: endOfMonth(now) };

  const dailyTasks = tasks.filter((t) => t.type === "daily");
  const weeklyTasks = tasks.filter((t) => t.type === "weekly");
  const monthlyTasks = tasks.filter((t) => t.type === "monthly");

  const completed = (list) => list.filter((t) => t.status === "completed").length;
  const pct = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

  // Daily progress: tasks with dueDate today OR type=daily
  const dailyScope = tasks.filter((t) => {
    const due = parseDateInput(t.dueDate);
    return t.type === "daily" || (due && isSameDay(due, now));
  });
  const dailyProgress = pct(completed(dailyScope), dailyScope.length);

  // Weekly progress: type=weekly or due within this week
  const weeklyScope = tasks.filter((t) => {
    const due = parseDateInput(t.dueDate);
    return (
      t.type === "weekly" ||
      (due && due >= weeklyRange.from && due <= weeklyRange.to)
    );
  });
  const weeklyProgress = pct(completed(weeklyScope), weeklyScope.length);

  // Monthly progress: type=monthly or due within this month
  const monthlyScope = tasks.filter((t) => {
    const due = parseDateInput(t.dueDate);
    return (
      t.type === "monthly" ||
      (due && due >= monthlyRange.from && due <= monthlyRange.to)
    );
  });
  const monthlyProgress = pct(completed(monthlyScope), monthlyScope.length);

  // Completed days map for calendar
  const completionByDate = useMemo(() => {
    const map = new Map(); // yyyy-mm-dd -> count completed
    tasks.forEach((t) => {
      if (t.status === "completed") {
        const d = t.dueDate || t.startDate;
        if (d) {
          map.set(d, (map.get(d) || 0) + 1);
        }
      }
    });
    return map;
  }, [tasks]);

  const filteredTasks = tasks.filter((t) =>
    filterType === "all" ? true : t.type === filterType
  );

  function upsertTask(data) {
    if (data.id) {
      setTasks((prev) => prev.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
    } else {
      const withId = { ...data, id: uid(), status: data.status || "pending" };
      setTasks((prev) => [withId, ...prev]);
    }
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleStatus(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status:
                t.status === "completed"
                  ? "pending"
                  : t.status === "pending"
                  ? "in-progress"
                  : "completed",
            }
          : t
      )
    );
  }

  return (
    <div className={"min-h-screen p-6 " + (themeDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900") }>
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Progress Tracker</h1>
          <nav className="flex gap-2 flex-wrap">
            {[
              "Dashboard",
              "Tasks",
              "Calendar",
              "Reports",
              "Settings",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  "px-3 py-2 rounded-xl text-sm font-medium " +
                  (activeTab === tab
                    ? "bg-indigo-600 text-white shadow"
                    : themeDark
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-100 border")
                }
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === "Dashboard" && (
          <section className="grid md:grid-cols-3 gap-4 mb-6">
            <ProgressCard title="Daily Progress" value={dailyProgress} subtitle={`${completed(dailyScope)}/${dailyScope.length} tasks`} />
            <ProgressCard title="Weekly Progress" value={weeklyProgress} subtitle={`${completed(weeklyScope)}/${weeklyScope.length} tasks`} />
            <ProgressCard title="Monthly Progress" value={monthlyProgress} subtitle={`${completed(monthlyScope)}/${monthlyScope.length} tasks`} />
          </section>
        )}

        {activeTab === "Dashboard" && (
          <QuickAdd onSave={upsertTask} />
        )}

        {activeTab === "Tasks" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                {[
                  { v: "all", l: "All" },
                  { v: "daily", l: "Daily" },
                  { v: "weekly", l: "Weekly" },
                  { v: "monthly", l: "Monthly" },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setFilterType(v)}
                    className={`px-3 py-1.5 rounded-xl text-sm ${
                      filterType === v
                        ? "bg-indigo-600 text-white"
                        : themeDark
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-white border hover:bg-gray-50"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setEditing({})}
                className="px-3 py-2 rounded-xl text-sm bg-emerald-600 text-white shadow"
              >
                + Add Task
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {filteredTasks.length === 0 && (
                <p className="text-sm opacity-70">No tasks yet. Add your first task!</p>
              )}

              {filteredTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={() => toggleStatus(t.id)}
                  onEdit={() => setEditing(t)}
                  onDelete={() => deleteTask(t.id)}
                  dark={themeDark}
                />)
              )}
            </div>
          </section>
        )}

        {activeTab === "Calendar" && (
          <CalendarView tasks={tasks} completionByDate={completionByDate} dark={themeDark} />
        )}

        {activeTab === "Reports" && (
          <ReportsView tasks={tasks} />
        )}

        {activeTab === "Settings" && (
          <SettingsView
            themeDark={themeDark}
            setThemeDark={setThemeDark}
            emailDaily={emailDaily}
            setEmailDaily={setEmailDaily}
            emailWeekly={emailWeekly}
            setEmailWeekly={setEmailWeekly}
          />
        )}

        {editing && (
          <TaskModal
            initial={editing}
            onClose={() => setEditing(null)}
            onSave={(data) => {
              upsertTask(data);
              setEditing(null);
            }}
            dark={themeDark}
          />
        )}

        <footer className="mt-10 text-xs opacity-60">
          <p>
            Data is stored locally in your browser. You can export by copying the localStorage value
            under key <code>{STORAGE_KEY}</code>.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ---------- UI Components ----------
function ProgressCard({ title, value, subtitle }) {
  return (
    <div className="p-4 rounded-2xl bg-white border shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-sm font-medium mb-2 opacity-80">{title}</h3>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-indigo-600"
          style={{ width: `${value}%` }}
          aria-label={`${value}%`}
        />
      </div>
      <div className="text-sm font-semibold">{value}%</div>
      {subtitle && <div className="text-xs opacity-70 mt-1">{subtitle}</div>}
    </div>
  );
}

function QuickAdd({ onSave }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("daily");
  const [dueDate, setDueDate] = useState(formatDateInput(new Date()));

  return (
    <div className="p-4 rounded-2xl bg-white border shadow-sm dark:bg-gray-800 dark:border-gray-700 mb-6">
      <h3 className="text-sm font-semibold mb-3">Quick Add</h3>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          className="flex-1 px-3 py-2 rounded-xl border bg-transparent"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded-xl border bg-transparent"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="px-3 py-2 rounded-xl border bg-transparent"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium"
          onClick={() => {
            if (!title.trim()) return;
            onSave({ title, type, dueDate, startDate: formatDateInput(new Date()), status: "pending", description: "" });
            setTitle("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete, dark }) {
  return (
    <div className={`p-4 rounded-2xl border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={onToggle}
            className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${
              task.status === "completed" ? "bg-emerald-600 border-emerald-600" : "bg-transparent"
            }`}
            aria-label="Toggle status"
            title="Toggle status"
          >
            {task.status === "completed" && (
              <span className="text-white text-xs">✓</span>
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{task.title}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${
                task.type === "daily"
                  ? "bg-blue-100 text-blue-700"
                  : task.type === "weekly"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-orange-100 text-orange-800"
              }`}>
                {task.type}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${
                task.status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : task.status === "in-progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {task.status}
              </span>
            </div>
            {task.description && (
              <p className="text-sm opacity-80 mt-1">{task.description}</p>
            )}
            <p className="text-xs opacity-70 mt-2">
              Start: {task.startDate || "—"} · Due: {task.dueDate || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-xl text-sm bg-indigo-600 text-white"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-xl text-sm bg-rose-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ initial = {}, onClose, onSave, dark }) {
  const isEdit = Boolean(initial.id);
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [type, setType] = useState(initial.type || "daily");
  const [startDate, setStartDate] = useState(initial.startDate || formatDateInput(new Date()));
  const [dueDate, setDueDate] = useState(initial.dueDate || formatDateInput(new Date()));
  const [status, setStatus] = useState(initial.status || "pending");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full max-w-lg p-5 rounded-2xl shadow-xl ${dark ? "bg-gray-900 border border-gray-700" : "bg-white"}`}>
        <h3 className="text-lg font-semibold mb-4">{isEdit ? "Edit Task" : "Add Task"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs opacity-70">Title</label>
            <input className="w-full px-3 py-2 rounded-xl border bg-transparent" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs opacity-70">Description</label>
            <textarea className="w-full px-3 py-2 rounded-xl border bg-transparent" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-xs opacity-70">Type</label>
            <select className="w-full px-3 py-2 rounded-xl border bg-transparent" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs opacity-70">Status</label>
            <select className="w-full px-3 py-2 rounded-xl border bg-transparent" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs opacity-70">Start Date</label>
            <input type="date" className="w-full px-3 py-2 rounded-xl border bg-transparent" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs opacity-70">Due Date</label>
            <input type="date" className="w-full px-3 py-2 rounded-xl border bg-transparent" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
            onClick={() => {
              if (!title.trim()) return;
              onSave({ id: initial.id, title, description, type, startDate, dueDate, status });
            }}
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ tasks, completionByDate, dark }) {
  const today = new Date();
  const first = startOfMonth(today);
  const last = endOfMonth(today);

  // Build calendar cells
  const days = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  const leadingBlanks = (first.getDay() + 6) % 7; // Monday-first grid

  return (
    <section className={`p-4 rounded-2xl border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <h3 className="text-sm font-semibold mb-4">{today.toLocaleString(undefined, { month: "long", year: "numeric" })}</h3>
      <div className="grid grid-cols-7 gap-2 text-xs">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="font-semibold opacity-70 text-center">{d}</div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((d) => {
          const key = formatDateInput(d);
          const done = completionByDate.get(key) || 0;
          const dueCount = tasks.filter((t) => t.dueDate === key).length;
          const isToday = isSameDay(d, new Date());
          return (
            <div
              key={key}
              className={`h-20 p-2 rounded-xl border flex flex-col justify-between ${
                isToday ? "border-indigo-600" : ""
              } ${dark ? "bg-gray-900 border-gray-700" : "bg-white"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-80">{d.getDate()}</span>
                {done > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">{done}✓</span>
                )}
              </div>
              <div className="text-[10px] opacity-70">{dueCount} due</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReportsView({ tasks }) {
  const now = new Date();
  const wkFrom = startOfWeek(now);
  const wkTo = endOfWeek(now);
  const moFrom = startOfMonth(now);
  const moTo = endOfMonth(now);

  const inRange = (t, from, to) => {
    const due = parseDateInput(t.dueDate);
    return due && due >= from && due <= to;
  };

  const weekly = tasks.filter((t) => inRange(t, wkFrom, wkTo));
  const monthly = tasks.filter((t) => inRange(t, moFrom, moTo));

  const summarize = (list) => ({
    planned: list.length,
    completed: list.filter((t) => t.status === "completed").length,
    inProgress: list.filter((t) => t.status === "in-progress").length,
    pending: list.filter((t) => t.status === "pending").length,
  });

  const w = summarize(weekly);
  const m = summarize(monthly);

  return (
    <section className="grid md:grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl bg-white border shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3">Weekly Breakdown</h3>
        <ReportStats {...w} />
      </div>
      <div className="p-4 rounded-2xl bg-white border shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3">Monthly Report</h3>
        <ReportStats {...m} />
      </div>
    </section>
  );
}

function ReportStats({ planned, completed, inProgress, pending }) {
  const percent = (num, den) => (den === 0 ? 0 : Math.round((num / den) * 100));
  const rows = [
    { label: "Completed", value: completed },
    { label: "In Progress", value: inProgress },
    { label: "Pending", value: pending },
  ];
  const total = planned;

  return (
    <div>
      <div className="text-sm opacity-80 mb-2">Planned: {planned}</div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{r.label}</span>
              <span>
                {r.value} ({percent(r.value, total)}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${percent(r.value, total)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ themeDark, setThemeDark, emailDaily, setEmailDaily, emailWeekly, setEmailWeekly }) {
  return (
    <section className="grid md:grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl bg-white border shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Dark Mode</div>
            <div className="text-xs opacity-70">Toggle dark theme</div>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={themeDark} onChange={(e) => setThemeDark(e.target.checked)} />
            <span className={`w-10 h-6 rounded-full p-1 transition ${themeDark ? "bg-indigo-600" : "bg-gray-300"}`}>
              <span className={`block w-4 h-4 bg-white rounded-full transition ${themeDark ? "translate-x-4" : ""}`} />
            </span>
          </label>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3">Email Notifications</h3>
        <div className="space-y-3">
          <ToggleRow
            label="Daily summary"
            desc="Send me an email with today's tasks"
            checked={emailDaily}
            onChange={setEmailDaily}
          />
          <ToggleRow
            label="Weekly recap"
            desc="Email me weekly stats and completion"
            checked={emailWeekly}
            onChange={setEmailWeekly}
          />
          <p className="text-xs opacity-70 pt-1">(This MVP stores preferences only. Hook up your Node.js/Nodemailer or SendGrid backend to actually send emails.)</p>
        </div>
      </div>
    </section>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs opacity-70">{desc}</div>
      </div>
      <label className="inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={`w-10 h-6 rounded-full p-1 transition ${checked ? "bg-indigo-600" : "bg-gray-300"}`}>
          <span className={`block w-4 h-4 bg-white rounded-full transition ${checked ? "translate-x-4" : ""}`} />
        </span>
      </label>
    </div>
  );
}
