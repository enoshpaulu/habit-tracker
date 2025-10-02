import { supabase } from '../lib/supabase'

// Map DB ↔ UI (snake_case ↔ camelCase if needed)
// Here we keep DB names to stay simple: start_date, due_date.

export async function listTasks(userId) {
  return await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function insertTask(userId, data) {
  return await supabase
    .from('tasks')
    .insert([{ ...data, user_id: userId }])
    .select()
    .single()
}

export async function updateTask(userId, id, patch) {
  return await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
}

export async function deleteTask(userId, id) {
  return await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

export function subscribeTasks(userId, onChange) {
  const channel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      onChange
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}
