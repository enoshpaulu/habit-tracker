  import { useState, useEffect } from 'react'
  import './App.css'
  import { supabase } from './lib/supabase'
  import Auth from './Auth'
  import ProgressShell from './pages/ProgressShell'

  function Placeholder() {
  return (
    <div className="p-6">
      <div className="mb-4">You are signed in ✅</div>
      <button
        className="px-3 py-2 rounded-xl bg-rose-600 text-white"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </button>
    </div>
  )
}
  
  export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="p-6">Loading…</div>
  if (!user) return <Auth onAuthed={setUser} />
  return <ProgressShell user={user} />
  
}