import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import { Sidebar } from '@/src/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <div className="flex min-h-screen" style={{ background: '#faf8f5' }}>
      <Sidebar userEmail={user.email} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
