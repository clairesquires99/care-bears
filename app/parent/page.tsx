'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/src/lib/supabase/client'
import { Conversation } from '@/src/lib/types'
import topicsData from '@/src/data/topics.json'
import { Topic } from '@/src/lib/types'
import { Button } from '@/src/components/ui/Button'

const topics = topicsData as Topic[]

type State = 'code-entry' | 'welcome'

export default function ParentPage() {
  const [state, setState] = useState<State>('code-entry')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const router = useRouter()

  const topic = conversation ? topics.find((t) => t.id === conversation.topic_id) : null

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from('conversations')
      .select('*')
      .eq('access_code', trimmed)
      .neq('status', 'draft')
      .single()

    if (dbError || !data) {
      setError("Code not found. Check with the person who invited you.")
      setLoading(false)
      return
    }

    setConversation(data)
    setState('welcome')
    setLoading(false)
  }

  function handleBegin() {
    if (!conversation) return
    router.push(`/parent/${conversation.id}`)
  }

  return (
    <main className="parent-screen min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#fef8f0' }}>
      <AnimatePresence mode="wait">
        {state === 'code-entry' ? (
          <motion.div
            key="code-entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-6 justify-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: '#d97706' }}>
                  C
                </div>
                <span className="font-semibold text-xl" style={{ color: '#1a1512' }}>Our Hearth</span>
              </div>
              <h1 className="text-3xl font-bold mb-3" style={{ color: '#1a1512' }}>
                Enter your access code
              </h1>
              <p style={{ color: '#6b5e52', fontSize: '1rem' }}>
                Your family member shared a code with you to begin a conversation.
              </p>
            </div>

            <div className="rounded-3xl p-8 shadow-sm" style={{ background: '#ffffff' }}>
              <form onSubmit={handleCodeSubmit} className="space-y-5">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full text-center text-3xl font-bold tracking-[0.3em] py-4 px-6 rounded-2xl border-2 outline-none uppercase"
                    style={{
                      borderColor: error ? '#ef4444' : '#fbd08f',
                      background: '#f6f3ef',
                      color: '#1a1512',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#f59e0b' }}
                    onBlur={(e) => { if (!error) e.target.style.borderColor = '#fbd08f' }}
                  />
                  {error && (
                    <p className="text-sm text-red-500 text-center mt-2">{error}</p>
                  )}
                </div>
                <Button type="submit" disabled={loading || code.length < 4} className="w-full" size="lg">
                  {loading ? 'Checking...' : "Let's Begin →"}
                </Button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg"
          >
            {/* Welcome card */}
            <div className="rounded-3xl p-10 shadow-sm mb-6 text-center" style={{ background: '#ffffff' }}>
              {/* Warm illustration placeholder */}
              <div
                className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl"
                style={{ background: '#fde8c8' }}
              >
                💬
              </div>

              <p className="text-sm font-medium mb-2" style={{ color: '#9a8a7d' }}>NEW INVITATION</p>
              <h1 className="text-3xl font-bold mb-3" style={{ color: '#1a1512' }}>
                You&apos;ve been invited to a conversation
              </h1>

              {topic && (
                <>
                  <p className="text-lg font-semibold mb-2" style={{ color: '#92400e' }}>
                    {topic.title}
                  </p>
                  <p style={{ color: '#6b5e52', fontSize: '1rem' }} className="mb-8">
                    {topic.description}
                  </p>
                </>
              )}

              <div className="flex gap-3 justify-center">
                <Button size="lg" onClick={handleBegin}>
                  Let&apos;s Begin →
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-3xl p-8" style={{ background: '#ffffff' }}>
              <h2 className="font-bold text-lg mb-6" style={{ color: '#1a1512' }}>How it works</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '💬', title: '1. Read the question', desc: 'Each question is shown one at a time, in plain language.' },
                  { icon: '✍️', title: '2. Share your thoughts', desc: 'Answer at your own pace. There are no wrong answers.' },
                  { icon: '🎁', title: '3. Give a gift', desc: 'Your answers become a precious record for your family.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="text-center">
                    <div className="text-3xl mb-2">{icon}</div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#1a1512' }}>{title}</p>
                    <p className="text-xs" style={{ color: '#9a8a7d' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
