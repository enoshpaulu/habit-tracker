import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function Auth({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) onAuthed(user)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 rounded-2xl border mt-16 space-y-3">
      <h2 className="text-xl font-semibold">{mode === 'signup' ? 'Create account' : 'Sign in'}</h2>
      <input
        className="w-full px-3 py-2 rounded-xl border"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
      />
      <input
        className="w-full px-3 py-2 rounded-xl border"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        required
      />
      {err && <div className="text-rose-600 text-sm">{err}</div>}
      <button disabled={busy} className="w-full px-3 py-2 rounded-xl bg-indigo-600 text-white">
        {busy ? 'Please wait…' : (mode === 'signup' ? 'Sign up' : 'Sign in')}
      </button>
      <button
        type="button"
        className="text-sm underline"
        onClick={()=>setMode(mode === 'signup' ? 'signin' : 'signup')}
      >
        {mode === 'signup' ? 'I have an account → Sign in' : 'New here? Create an account'}
      </button>
    </form>
  )
}
