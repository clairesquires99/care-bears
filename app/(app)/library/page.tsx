import { createClient } from '@/src/lib/supabase/server'
import topicsData from '@/src/data/topics.json'
import { Topic } from '@/src/lib/types'
import { TopicCard } from '@/src/components/TopicCard'
import { CustomStoryCard } from '@/src/components/CustomStoryCard'

export const dynamic = 'force-dynamic'

const topics = topicsData as Topic[]

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: conversations }, { data: interest }] = await Promise.all([
    user
      ? supabase
          .from('conversations')
          .select('topic_id')
          .eq('user_id', user.id)
          .neq('status', 'draft')
      : Promise.resolve({ data: [] }),
    user
      ? supabase
          .from('custom_story_interests')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const sentTopicIds = new Set((conversations ?? []).map((c) => c.topic_id))
  const hasRegistered = interest !== null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#2a1806' }}>
          Conversation Library
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9a7040' }}>
          Choose a topic to start a guided conversation with your loved one.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} hasSent={sentTopicIds.has(topic.id)} />
        ))}
        <CustomStoryCard hasRegistered={hasRegistered} />
      </div>
    </div>
  )
}
