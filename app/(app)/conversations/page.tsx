import Link from 'next/link'
import { createClient } from '@/src/lib/supabase/server'
import topicsData from '@/src/data/topics.json'
import { Topic } from '@/src/lib/types'
import { Badge } from '@/src/components/ui/Badge'

const topics = topicsData as Topic[]

type ConvRow = {
  id: string
  topic_id: string
  status: string
  sent_at: string | null
  access_code: string | null
  relationships: { display_name: string } | null
}

const categoryColors: Record<string, { bg: string; color: string }> = {
  'Getting to Know': { bg: '#dbeafe', color: '#1d4ed8' },
  Legacy: { bg: '#fde8c8', color: '#92400e' },
  Medical: { bg: '#dcfce7', color: '#15803d' },
  Healthcare: { bg: '#ffe4e6', color: '#e11d48' },
  Finances: { bg: '#d1fae5', color: '#059669' },
}

const statusLabel: Record<string, string> = {
  sent: 'Sent',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: conversations } = user
    ? await supabase
        .from('conversations')
        .select('id, topic_id, status, sent_at, access_code, relationships(display_name)')
        .eq('user_id', user.id)
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
    : { data: [] }

  const convRows = (conversations ?? []) as unknown as ConvRow[]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1a1512' }}>
          Your Conversations
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6b5e52' }}>
          Track conversations you&apos;ve sent and view completed responses.
        </p>
      </div>

      {convRows.length === 0 ? (
        <div
          className="rounded-3xl p-10 text-center"
          style={{ background: '#ffffff' }}
        >
          <p className="text-sm" style={{ color: '#9a8a7d' }}>
            No conversations yet.{' '}
            <Link href="/library" className="font-medium" style={{ color: '#d97706' }}>
              Start one from the Library.
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {convRows.map((conv) => {
            const topic = topics.find((t) => t.id === conv.topic_id)
            const cat = topic ? (categoryColors[topic.category] ?? { bg: '#f6f3ef', color: '#6b5e52' }) : { bg: '#f6f3ef', color: '#6b5e52' }
            const recipient = conv.relationships?.display_name ?? 'Unknown'
            const sentDate = conv.sent_at
              ? new Date(conv.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : null

            return (
              <div
                key={conv.id}
                className="rounded-3xl px-6 py-5 flex items-center gap-4"
                style={{ background: '#ffffff' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      {topic?.category ?? 'Unknown'}
                    </span>
                    {topic && (
                      <Link
                        href={`/library/${topic.id}`}
                        className="text-sm font-semibold hover:underline truncate"
                        style={{ color: '#1a1512' }}
                      >
                        {topic.title}
                      </Link>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#9a8a7d' }}>
                    {recipient}
                    {sentDate && <> · Sent {sentDate}</>}
                  </p>
                </div>

                <Badge status={conv.status as 'sent' | 'in-progress' | 'completed'}>
                  {statusLabel[conv.status] ?? conv.status}
                </Badge>

                {conv.status === 'completed' ? (
                  <Link
                    href={`/conversations/${conv.id}`}
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: '#d97706' }}
                  >
                    View responses →
                  </Link>
                ) : (
                  <span
                    className="text-xs font-mono px-2.5 py-1 rounded-xl border whitespace-nowrap"
                    style={{ borderColor: '#e5ddd5', color: '#6b5e52', background: '#f6f3ef' }}
                  >
                    {conv.access_code}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
