'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/src/lib/supabase/client'

function VerifyForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error || !data.user) {
      setError(error?.message ?? 'Invalid code. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single()
    if (!profile) {
      await supabase.from('profiles').insert({ id: data.user.id, email: data.user.email! })
      router.push('/onboarding')
    } else {
      router.push('/library')
    }
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="inline-flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#d97706' }}>
          C
        </div>
        <span className="font-semibold text-lg" style={{ color: '#1a1512' }}>Care Conversations</span>
      </div>

      <div className="rounded-3xl p-10 shadow-sm" style={{ background: '#ffffff' }}>
        <div className="text-5xl mb-6">✉️</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: '#1a1512' }}>
          Check your email
        </h1>
        <p className="text-base mb-1" style={{ color: '#6b5e52' }}>
          We sent a 6-digit code to
        </p>
        {email && (
          <p className="font-semibold text-base mb-6" style={{ color: '#1a1512' }}>
            {email}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
            className="w-full px-4 py-4 rounded-xl border text-center text-3xl font-bold tracking-[0.5em] outline-none transition-all"
            style={{
              borderColor: '#d6ccc3',
              background: '#f6f3ef',
              color: '#1a1512',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#d97706' }}
            onBlur={(e) => { e.target.style.borderColor = '#d6ccc3' }}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white text-base transition-all disabled:opacity-60"
            style={{ background: '#d97706' }}
          >
            {loading ? 'Verifying...' : 'Verify code →'}
          </button>
        </form>

        <p className="mt-4 text-sm" style={{ color: '#9a8a7d' }}>
          Or click the link in your email to sign in automatically.
        </p>
      </div>

      <p className="mt-6 text-sm" style={{ color: '#9a8a7d' }}>
        Wrong email?{' '}
        <Link href="/" className="underline" style={{ color: '#d97706' }}>
          Go back
        </Link>
      </p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#fef8f0' }}>
      <Suspense>
        <VerifyForm />
      </Suspense>
    </main>
  )
}
