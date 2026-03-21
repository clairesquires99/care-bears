'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/Button'
import { APP_NAME } from '@/src/lib/constants'

const QUICK_NAMES = ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Partner']

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName || !email) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { error } = await supabase.from('relationships').insert({
      user_id: user.id,
      display_name: displayName,
      email,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/library')
  }

  function handleSkip() {
    router.push('/library')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#fef8f0' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#d97706' }}>
              C
            </div>
            <span className="font-semibold text-lg" style={{ color: '#1a1512' }}>{APP_NAME}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1a1512' }}>
            Who do you want to start a conversation with?
          </h1>
          <p className="text-sm" style={{ color: '#6b5e52' }}>
            Add a parent or loved one to get started.
          </p>
        </div>

        <div className="rounded-3xl p-8 shadow-sm" style={{ background: '#ffffff' }}>
          <form onSubmit={handleAdd} className="space-y-4">
            {/* Quick name chips */}
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: '#1a1512' }}>Quick select</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setDisplayName(name)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                    style={{
                      background: displayName === name ? '#fde8c8' : 'transparent',
                      borderColor: displayName === name ? '#f59e0b' : '#e5ddd5',
                      color: displayName === name ? '#92400e' : '#6b5e52',
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1a1512' }}>
                Or enter a name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Mom, Dad, Aunt Carol"
                className="w-full px-4 py-3 rounded-xl border text-base outline-none"
                style={{ borderColor: '#e5ddd5', background: '#f6f3ef' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1a1512' }}>
                Their email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-4 py-3 rounded-xl border text-base outline-none"
                style={{ borderColor: '#e5ddd5', background: '#f6f3ef' }}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !displayName}
              className="w-full"
            >
              {loading ? 'Adding...' : 'Add & go to library →'}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleSkip}
            className="text-sm underline"
            style={{ color: '#9a8a7d' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
  )
}
