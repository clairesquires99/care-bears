'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addRelationship(displayName: string, email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('relationships').insert({
    user_id: user.id,
    display_name: displayName,
    email: email || '',
  })

  if (error) return { error: error.message }
  revalidatePath('/relationships')
  return { error: null }
}

export async function deleteRelationship(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('relationships').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/relationships')
  return { error: null }
}
