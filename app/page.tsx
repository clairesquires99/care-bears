import { redirect } from 'next/navigation'
import LandingPageClient from './LandingPageClient'

export default function LandingPage() {
  if (process.env.DEV_BYPASS_AUTH === 'true') redirect('/library')
  return <LandingPageClient />
}
