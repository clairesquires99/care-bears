'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { APP_NAME } from '@/src/lib/constants'
import { createClient } from '@/src/lib/supabase/client'

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
]

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <aside
      className="hidden lg:flex w-60 min-h-screen flex-col py-6 px-4 border-r"
      style={{
        background: '#ffffff',
        borderColor: 'rgba(60,30,10,0.10)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <Image
          src="/logo.svg"
          alt={APP_NAME}
          width={32}
          height={32}
          className="rounded-xl shrink-0 object-cover"
        />
        <span className="font-semibold text-sm" style={{ color: '#2a1806' }}>
          {APP_NAME}
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
                background: active ? 'rgba(216,112,26,0.05)' : 'transparent',
                color: active ? '#2a1806' : '#9a7040',
              }}
            >
              <span style={{ color: active ? '#d8701a' : '#9a7040' }}>
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      {userEmail && (
        <div className="mt-auto pt-4 border-t relative" style={{ borderColor: 'rgba(60,30,10,0.10)' }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: '#9a7040' }}
            title={userEmail}
          >
            {userEmail.length > 28 ? userEmail.slice(0, 26) + '…' : userEmail}
          </button>
          {menuOpen && (
            <div
              className="absolute bottom-full left-0 mb-1 w-full rounded-xl border shadow-sm overflow-hidden"
              style={{ background: '#ffffff', borderColor: 'rgba(60,30,10,0.10)' }}
            >
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm px-4 py-2.5 transition-colors"
                style={{ color: '#9a7040' }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
