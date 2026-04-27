'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addRelationship(displayName: string, email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase.from('relationships').insert({
    user_id: user.id,
    display_name: displayName,
    email: email || '',
  }).select().single()

  if (error) return { error: error.message, data: null }
  revalidatePath('/relationships')
  return { error: null, data }
}

export async function deleteRelationship(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('relationships').delete().eq('id', id).eq('user_id', user.id)
  if (error) {
    if (error.code === '23503') return { error: 'This person has conversations linked to them and can\'t be removed.' }
    return { error: error.message }
  }
  revalidatePath('/relationships')
  return { error: null }
}
