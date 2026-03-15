import { createClient } from '@/src/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists (determines new vs returning user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // New user — create profile and go to onboarding
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
        })
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Returning user
      return NextResponse.redirect(`${origin}/library`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
