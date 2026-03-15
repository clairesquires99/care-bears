import Link from 'next/link'

export default function CompletePage() {
  return (
    <main className="parent-screen min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center" style={{ background: '#fef8f0' }}>
      <div className="w-full max-w-md">
        <div
          className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-5xl"
          style={{ background: '#fde8c8' }}
        >
          🎁
        </div>

        <h1 className="text-3xl font-bold mb-4" style={{ color: '#1a1512' }}>
          Thank you
        </h1>
        <p className="text-lg mb-6" style={{ color: '#6b5e52' }}>
          You&apos;ve just given your family a tremendous gift — the clarity and comfort of knowing your wishes.
        </p>
        <p style={{ color: '#9a8a7d' }}>
          Your answers have been saved. The person who invited you will be able to see your responses.
        </p>

        <div className="mt-10 rounded-3xl p-6" style={{ background: '#ffffff' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#1a1512' }}>
            Want to start your own conversations?
          </p>
          <p className="text-sm mb-4" style={{ color: '#9a8a7d' }}>
            Care Conversations helps families have these important discussions.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold text-base"
            style={{ background: '#d97706' }}
          >
            Learn more →
          </Link>
        </div>
      </div>
    </main>
  )
}
