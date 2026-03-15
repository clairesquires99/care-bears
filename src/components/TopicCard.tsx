import Link from 'next/link'
import { Topic } from '@/src/lib/types'
import { Badge } from '@/src/components/ui/Badge'

interface TopicCardProps {
  topic: Topic
  conversationStatus?: string | null
}

const categoryColors: Record<string, { bg: string; color: string }> = {
  Legacy: { bg: '#fde8c8', color: '#92400e' },
  Healthcare: { bg: '#ffe4e6', color: '#e11d48' },
  Finances: { bg: '#d1fae5', color: '#059669' },
}

export function TopicCard({ topic, conversationStatus }: TopicCardProps) {
  const cat = categoryColors[topic.category] ?? { bg: '#f6f3ef', color: '#6b5e52' }

  return (
    <Link
      href={`/library/${topic.id}`}
      className="block rounded-3xl p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: '#ffffff' }}
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: cat.bg, color: cat.color }}
        >
          {topic.category}
        </span>
        {conversationStatus && (
          <Badge status={conversationStatus as 'draft' | 'sent' | 'in-progress' | 'completed'}>
            {conversationStatus}
          </Badge>
        )}
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: '#1a1512' }}>
        {topic.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: '#6b5e52' }}>
        {topic.description}
      </p>
      <p className="text-xs mt-4" style={{ color: '#9a8a7d' }}>
        {topic.questions.length} questions →
      </p>
    </Link>
  )
}
