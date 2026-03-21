'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  userEmail?: string
}

const navItems = [
  {
    href: '/library',
    label: 'Library',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: '/conversations',
    label: 'Conversations',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/relationships',
    label: 'Relationships',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex w-60 min-h-screen flex-col py-6 px-4 border-r"
      style={{
        background: '#ffffff',
        borderColor: '#ede6dc',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: '#d97706' }}
        >
          C
        </div>
        <span className="font-semibold text-sm" style={{ color: '#1a1512' }}>
          Our Hearth
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? '#fef8f0' : 'transparent',
                color: active ? '#92400e' : '#6b5e52',
              }}
            >
              <span style={{ color: active ? '#d97706' : '#9a8a7d' }}>
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      {userEmail && (
        <div className="mt-auto pt-4 border-t" style={{ borderColor: '#ede6dc' }}>
          <p className="text-xs px-3" style={{ color: '#9a8a7d' }} title={userEmail}>
            {userEmail.length > 28 ? userEmail.slice(0, 26) + '…' : userEmail}
          </p>
        </div>
      )}
    </aside>
  )
}
