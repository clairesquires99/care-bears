'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendConversation(payload: {
  relationshipId: string
  topicId: string
  code: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('conversations').upsert(
    {
      user_id: user.id,
      relationship_id: payload.relationshipId,
      topic_id: payload.topicId,
      status: 'sent',
      access_code: payload.code,
      sent_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic_id,relationship_id' },
  )

  if (error) return { error: error.message }
  revalidatePath(`/library/${payload.topicId}`)
  return { error: null }
}
