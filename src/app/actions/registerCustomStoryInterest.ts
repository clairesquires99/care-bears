'use server'

import { createClient } from '@/src/lib/supabase/server'

export async function registerCustomStoryInterest() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('custom_story_interests')
    .insert({ user_id: user.id })

  return { error: error?.message ?? null }
}
