export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface Relationship {
  id: string
  user_id: string
  display_name: string
  email: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  relationship_id: string | null
  topic_id: string
  status: 'draft' | 'sent' | 'in-progress' | 'completed'
  access_code: string | null
  sent_at: string | null
  created_at: string
}

export interface Answer {
  id: string
  conversation_id: string
  question_id: string
  answer: string
  created_at: string
}

export interface Topic {
  id: string
  title: string
  description: string
  category: string
  storyFile: string
}

export interface ConversationWithRelationship extends Conversation {
  relationships: Relationship | null
}
