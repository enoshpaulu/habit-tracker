// src/components/SettingsView.jsx
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function SettingsView({ user, themeDark, setThemeDark }) {
  const [defaultTab, setDefaultTab] = useState("Dashboard")

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("settings")
    if (saved) {
      const parsed = JSON.parse(saved)
      setDefaultTab(parsed.defaultTab || "Dashboard")
    }
  }, [])

  // Save whenever preferences change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify({ defaultTab }))
  }, [defaultTab])

  return (
    <div className="p-5 rounded-3xl shadow-md ring-1 ring-black/5 bg-white/85 dark:bg-gray-900/75 dark:ring-white/10 space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Profile */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Profile</h3>
        <p className="text-sm">Signed in as: <span className="font-medium">{user?.email}</span></p>
      </div>

      {/* Theme toggle */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Appearance</h3>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={themeDark}
            onChange={(e) => setThemeDark(e.target.checked)}
          />
          <span className={`w-10 h-6 rounded-full p-1 transition ${themeDark ? "bg-indigo-600" : "bg-gray-300"}`}>
            <span className={`block w-4 h-4 bg-white rounded-full transition ${themeDark ? "translate-x-4" : ""}`} />
          </span>
          <span className="text-sm">{themeDark ? "Dark Mode" : "Light Mode"}</span>
        </label>
      </div>

      {/* Default tab */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Preferences</h3>
        <label className="text-sm">Default Tab: </label>
        <select
          className="ml-2 px-3 py-1.5 border rounded-lg text-sm bg-white dark:bg-gray-800"
          value={defaultTab}
          onChange={(e) => setDefaultTab(e.target.value)}
        >
          <option>Dashboard</option>
          <option>Tasks</option>
          <option>Calendar</option>
          <option>Reports</option>
        </select>
      </div>
    </div>
  )
}
