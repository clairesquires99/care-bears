import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/src/lib/supabase/server'
import topicsData from '@/src/data/topics.json'
import { Topic, Answer } from '@/src/lib/types'
import { Badge } from '@/src/components/ui/Badge'
import { Card } from '@/src/components/ui/Card'

const topics = topicsData as Topic[]

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: conv } = await supabase
    .from('conversations')
    .select('*, relationships(*)')
    .eq('id', id)
    .single()

  if (!conv) notFound()

  const topic = topics.find((t) => t.id === conv.topic_id)
  if (!topic) notFound()

  const { data: answers } = await supabase
    .from('answers')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at')

  const answerMap = (answers ?? []).reduce<Record<string, Answer>>(
    (acc, a: Answer) => ({ ...acc, [a.question_id]: a }),
    {}
  )

  const relationship = conv.relationships as { display_name: string; email: string } | null

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link href="/library" className="text-sm mb-6 inline-block" style={{ color: '#9a8a7d' }}>
        ← Library
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold" style={{ color: '#1a1512' }}>
            {topic.title}
          </h1>
          <Badge status={conv.status as 'draft' | 'sent' | 'in-progress' | 'completed'}>
            {conv.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm" style={{ color: '#9a8a7d' }}>
          {relationship && (
            <span>Sent to <strong style={{ color: '#1a1512' }}>{relationship.display_name}</strong></span>
          )}
          {conv.access_code && (
            <span>
              Code: <code className="font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: '#fde8c8', color: '#92400e' }}>
                {conv.access_code}
              </code>
            </span>
          )}
          {conv.sent_at && (
            <span>Sent {new Date(conv.sent_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Answers */}
      {answers && answers.length === 0 ? (
        <Card muted className="p-8 text-center">
          <p className="text-sm mb-1 font-medium" style={{ color: '#1a1512' }}>No answers yet</p>
          <p className="text-sm" style={{ color: '#9a8a7d' }}>
            {conv.status === 'sent'
              ? `Share the access code with ${relationship?.display_name ?? 'your contact'} to get started.`
              : 'Waiting for responses.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {topic.questions.map((q, i) => {
            const answer = answerMap[q.id]
            return (
              <Card key={q.id} className="p-5 shadow-sm">
                <div className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{
                      background: answer ? '#059669' : '#f6f3ef',
                      color: answer ? '#fff' : '#9a8a7d',
                    }}
                  >
                    {answer ? '✓' : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                      {q.text}
                    </p>
                    {answer ? (
                      <p
                        className="text-sm font-semibold px-4 py-2 rounded-xl inline-block"
                        style={{ background: '#fef8f0', color: '#92400e' }}
                      >
                        {answer.answer}
                      </p>
                    ) : (
                      <p className="text-sm" style={{ color: '#c4a592' }}>No answer yet</p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
