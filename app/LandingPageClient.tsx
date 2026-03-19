'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/src/lib/supabase/client'

export default function LandingPageClient() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#faf8f5' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#d97706' }}>
              C
            </div>
            <span className="font-semibold text-lg" style={{ color: '#1a1512' }}>Care Conversations</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: '#1a1512' }}>
            Have the conversations<br />that matter most
          </h1>
          <p className="text-base" style={{ color: '#5c4d42' }}>
            Guided conversations to help you and your parents discuss end-of-life wishes, healthcare, and finances — with warmth, not awkwardness.
          </p>
        </div>

        {/* Email form */}
        <div className="rounded-3xl p-8 shadow-sm border" style={{ background: '#ffffff', borderColor: '#ede6dc' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                Your email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border text-base outline-none transition-all"
                style={{
                  borderColor: '#d6ccc3',
                  background: '#f6f3ef',
                  color: '#1a1512',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#d97706' }}
                onBlur={(e) => { e.target.style.borderColor = '#d6ccc3' }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white text-base transition-all disabled:opacity-60"
              style={{ background: '#d97706' }}
            >
              {loading ? 'Sending link...' : 'Get started →'}
            </button>
          </form>

          <p className="mt-4 text-xs text-center" style={{ color: '#8a7568' }}>
            We&apos;ll email you a magic link — no password needed.
          </p>
        </div>

        {/* Demo link */}
        <p className="mt-8 text-center text-sm" style={{ color: '#8a7568' }}>
          Also try our{' '}
          <Link href="/mad-lib-death" className="underline font-medium" style={{ color: '#d97706' }}>
            interactive demo
          </Link>
        </p>
      </div>
    </main>
  )
}
