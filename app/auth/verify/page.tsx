import Link from 'next/link'

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#fef8f0' }}>
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
          <p className="text-base mb-2" style={{ color: '#6b5e52' }}>
            We sent a magic link to
          </p>
          {email && (
            <p className="font-semibold text-base mb-6" style={{ color: '#1a1512' }}>
              {email}
            </p>
          )}
          <p className="text-sm" style={{ color: '#9a8a7d' }}>
            Click the link in your email to sign in. The link expires in 1 hour.
          </p>
        </div>

        <p className="mt-6 text-sm" style={{ color: '#9a8a7d' }}>
          Wrong email?{' '}
          <Link href="/" className="underline" style={{ color: '#d97706' }}>
            Go back
          </Link>
        </p>
      </div>
    </main>
  )
}
