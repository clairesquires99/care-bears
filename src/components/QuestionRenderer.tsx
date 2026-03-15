'use client'

import { Question } from '@/src/lib/types'

interface QuestionRendererProps {
  question: Question
  currentAnswer: string
  onAnswer: (answer: string) => void
}

export function QuestionRenderer({ question, currentAnswer, onAnswer }: QuestionRendererProps) {
  const parts = question.sentenceTemplate.split('[blank]')
  const before = parts[0] ?? ''
  const after = parts[1] ?? ''

  return (
    <div className="text-2xl font-medium leading-relaxed" style={{ color: '#1a1512' }}>
      <span>{before}</span>

      {question.type === 'choice' && question.options ? (
        <span className="inline-flex flex-wrap items-center gap-2 mx-2">
          {currentAnswer ? (
            <button
              onClick={() => onAnswer('')}
              className="px-4 py-1.5 rounded-xl font-semibold text-xl underline decoration-dashed cursor-pointer transition-all"
              style={{ color: '#d97706', background: '#fef8f0' }}
            >
              {currentAnswer} ×
            </button>
          ) : (
            <span className="inline-flex flex-wrap gap-2">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onAnswer(opt)}
                  className="px-4 py-1.5 rounded-xl border-2 text-xl font-medium transition-all hover:border-brand-400"
                  style={{
                    borderColor: '#f9b55a',
                    color: '#92400e',
                    background: '#fef8f0',
                  }}
                >
                  {opt}
                </button>
              ))}
            </span>
          )}
        </span>
      ) : (
        <span className="inline-block mx-1">
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="type here..."
            className="border-b-2 outline-none bg-transparent text-xl font-medium px-1 pb-0.5 min-w-[200px]"
            style={{
              borderColor: currentAnswer ? '#f59e0b' : '#fbd08f',
              color: currentAnswer ? '#1a1512' : '#9a8a7d',
            }}
          />
        </span>
      )}

      <span>{after}</span>
    </div>
  )
}
