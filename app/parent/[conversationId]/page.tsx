'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/src/lib/supabase/client'
import { Conversation, Question, Topic } from '@/src/lib/types'
import topicsData from '@/src/data/topics.json'
import { QuestionRenderer } from '@/src/components/QuestionRenderer'
import { ProgressBar } from '@/src/components/ProgressBar'
import { Button } from '@/src/components/ui/Button'

const topics = topicsData as Topic[]

function buildQuestionMap(questions: Question[]): Map<string, Question> {
  return new Map(questions.map((q) => [q.id, q]))
}

export default function ParentConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params)
  const router = useRouter()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showWhy, setShowWhy] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .neq('status', 'draft')
        .single()

      if (!conv) { router.push('/parent'); return }

      const t = topics.find((t) => t.id === conv.topic_id)
      if (!t) { router.push('/parent'); return }

      setConversation(conv)
      setTopic(t)
      setCurrentQuestionId(t.questions[0].id)

      // Load existing answers
      const { data: existingAnswers } = await supabase
        .from('answers')
        .select('question_id, answer')
        .eq('conversation_id', conversationId)

      if (existingAnswers) {
        const answerMap = existingAnswers.reduce<Record<string, string>>(
          (acc, a) => ({ ...acc, [a.question_id]: a.answer }),
          {}
        )
        setAnswers(answerMap)
      }

      // Update status to in-progress if it was sent
      if (conv.status === 'sent') {
        await supabase
          .from('conversations')
          .update({ status: 'in-progress' })
          .eq('id', conversationId)
      }

      setLoading(false)
    }
    load()
  }, [conversationId, router])

  async function handleAnswer(answer: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestionId!]: answer }))
  }

  async function handleNext() {
    if (!topic || !currentQuestionId) return
    const qMap = buildQuestionMap(topic.questions)
    const question = qMap.get(currentQuestionId)
    if (!question) return

    const currentAnswer = answers[currentQuestionId] ?? ''

    // Upsert answer
    const supabase = createClient()
    const { data: existing } = await supabase
      .from('answers')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('question_id', currentQuestionId)
      .single()

    if (existing) {
      await supabase
        .from('answers')
        .update({ answer: currentAnswer })
        .eq('id', existing.id)
    } else if (currentAnswer) {
      await supabase.from('answers').insert({
        conversation_id: conversationId,
        question_id: currentQuestionId,
        answer: currentAnswer,
      })
    }

    // Determine next question
    const matchedFollowUp = question.followUps?.find((f) => f.when === currentAnswer)
    const nextId = matchedFollowUp?.next ?? question.next

    if (!nextId) {
      // Completed
      await supabase
        .from('conversations')
        .update({ status: 'completed' })
        .eq('id', conversationId)
      router.push(`/parent/${conversationId}/complete`)
      return
    }

    setHistory((prev) => [...prev, currentQuestionId])
    setCurrentQuestionId(nextId)
  }

  function handleBack() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setCurrentQuestionId(prev)
  }

  async function handleSkip() {
    if (!topic || !currentQuestionId) return
    const qMap = buildQuestionMap(topic.questions)
    const question = qMap.get(currentQuestionId)
    if (!question) return

    const nextId = question.next
    if (!nextId) {
      router.push(`/parent/${conversationId}/complete`)
      return
    }
    setHistory((prev) => [...prev, currentQuestionId])
    setCurrentQuestionId(nextId)
  }

  if (loading || !topic || !currentQuestionId) {
    return (
      <main className="parent-screen min-h-screen flex items-center justify-center" style={{ background: '#fef8f0' }}>
        <p style={{ color: '#9a8a7d' }}>Loading...</p>
      </main>
    )
  }

  const qMap = buildQuestionMap(topic.questions)
  const currentQuestion = qMap.get(currentQuestionId)!
  const progress = ((history.length) / topic.questions.length) * 100

  // Build section nav (just the question list)
  const answeredCount = Object.keys(answers).length
  const totalQ = topic.questions.length

  return (
    <main className="parent-screen min-h-screen flex" style={{ background: '#fef8f0' }}>
      {/* Sidebar */}
      <aside
        className="w-56 min-h-screen flex flex-col py-8 px-5 border-r"
        style={{ background: '#ffffff', borderColor: '#ede6dc' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: '#d97706' }}>
            C
          </div>
          <span className="font-semibold text-sm" style={{ color: '#1a1512' }}>Care Conversations</span>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: '#9a8a7d' }}>
          {topic.title}
        </p>

        {/* Question nav */}
        <div className="flex-1 flex flex-col gap-1">
          {topic.questions.map((q, i) => {
            const isAnswered = !!answers[q.id]
            const isCurrent = q.id === currentQuestionId
            return (
              <div
                key={q.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: isCurrent ? '#fef8f0' : 'transparent',
                  color: isCurrent ? '#92400e' : '#9a8a7d',
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{
                    background: isAnswered ? '#059669' : isCurrent ? '#f9b55a' : '#e5ddd5',
                    color: isAnswered || isCurrent ? '#fff' : '#9a8a7d',
                  }}
                >
                  {isAnswered ? '✓' : i + 1}
                </span>
                <span className="truncate">{q.text.slice(0, 30)}…</span>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: '#ede6dc' }}>
          <p className="text-xs mb-2" style={{ color: '#9a8a7d' }}>
            {answeredCount} of {totalQ} Completed
          </p>
          <ProgressBar value={progress} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-10 max-w-2xl">
          <h1 className="font-bold mb-2" style={{ color: '#1a1512', fontSize: '1.5rem' }}>
            Capturing your wishes
          </h1>
          <p className="text-sm mb-10" style={{ color: '#9a8a7d' }}>
            Take your time. There are no wrong answers — only what feels right for you.
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <QuestionRenderer
                question={currentQuestion}
                currentAnswer={answers[currentQuestionId] ?? ''}
                onAnswer={handleAnswer}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="border-t px-10 py-6" style={{ borderColor: '#ede6dc', background: '#ffffff' }}>
          {/* Why this matters (collapsible) */}
          <div className="mb-5">
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="text-sm flex items-center gap-1"
              style={{ color: '#9a8a7d' }}
            >
              <span>{showWhy ? '▼' : '▶'}</span>
              Why this matters
            </button>
            <AnimatePresence>
              {showWhy && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: '#6b5e52' }}>
                    This question helps your family understand your wishes clearly. Writing it down reduces confusion and stress, so your loved ones can focus on what matters most.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                disabled={history.length === 0}
                className="text-sm disabled:opacity-40"
                style={{ color: '#6b5e52' }}
              >
                ← Back
              </button>
              <button
                onClick={handleSkip}
                className="text-sm"
                style={{ color: '#9a8a7d' }}
              >
                Skip for now
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-sm" style={{ color: '#9a8a7d' }}>
                💬 Feedback / help me think
              </button>
              <Button onClick={handleNext} size="md">
                Next step →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
