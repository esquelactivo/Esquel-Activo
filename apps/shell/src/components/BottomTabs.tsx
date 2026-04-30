'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { signOut } from 'next-auth/react'
import { PushSettingsCard } from './PushSettingsCard'

type Session = {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

type NotificationData = { unread: number }

export function BottomTabs({ session }: { session: Session }) {
  const pathname = usePathname()
  const { count, openCart } = useCart()
  const [unread, setUnread] = useState(0)
  const [showProfile, setShowProfile] = useState(false)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data: NotificationData = await res.json()
      setUnread(data.unread)
    } catch {}
  }, [])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30_000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  const tabs = [
    {
      label: 'Inicio',
      href: '/',
      icon: <HomeIcon />,
      active: pathname === '/',
    },
    {
      label: 'Notificaciones',
      href: '/notifications',
      icon: <BellIcon />,
      active: pathname === '/notifications',
      badge: unread > 0 ? unread : null,
    },
  ]

  return (
    <>
      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {tabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
                tab.active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="relative">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}

          {/* Carrito */}
          <button
            onClick={openCart}
            className="relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="relative">
              <CartIcon />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">Carrito</span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => setShowProfile(true)}
            className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
              pathname === '/profile' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserIcon />
            <span className="text-[10px] font-medium">Yo</span>
          </button>
        </div>
      </div>

      {/* Profile modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowProfile(false)} />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-white shadow-2xl p-6 pb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white text-xl font-bold shrink-0">
                {session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{session.user.name ?? 'Cliente'}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <PushSettingsCard />
              <button
                onClick={() => { signOut({ callbackUrl: '/' }) }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-500"
              >
                <span>↩</span>
                <span className="text-sm font-medium">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
