import { createClient } from '@/src/lib/supabase/server'
import { Relationship } from '@/src/lib/types'
import { RelationshipsClient } from './client'

export default async function RelationshipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('relationships')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at')
  const relationships = (data ?? []) as Relationship[]

  return <RelationshipsClient initial={relationships} />
}
