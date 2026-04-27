import { createClient } from '@supabase/supabase-js'
import { Conversation } from '@/src/lib/types'
import { ParentClient } from './client'

export default async function ParentPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  let initialConversation: Conversation | null = null

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    )
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('access_code', code.trim().toUpperCase())
      .neq('status', 'draft')
      .single()

    initialConversation = data ?? null
  }

  return <ParentClient initialConversation={initialConversation} />
}
