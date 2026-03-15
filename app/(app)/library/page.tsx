import { createClient } from '@/src/lib/supabase/server'
import topicsData from '@/src/data/topics.json'
import { Topic } from '@/src/lib/types'
import { TopicCard } from '@/src/components/TopicCard'

const topics = topicsData as Topic[]

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's conversations to show status badges
  const { data: conversations } = user
    ? await supabase
        .from('conversations')
        .select('topic_id, status')
        .eq('user_id', user.id)
    : { data: [] }

  const statusByTopic = (conversations ?? []).reduce<Record<string, string>>(
    (acc, c) => ({ ...acc, [c.topic_id]: c.status }),
    {}
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1a1512' }}>
          Conversation Library
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6b5e52' }}>
          Choose a topic to start a guided conversation with your loved one.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            conversationStatus={statusByTopic[topic.id] ?? null}
          />
        ))}
      </div>
    </div>
  )
}
