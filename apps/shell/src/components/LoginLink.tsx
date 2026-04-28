'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002'

export function LoginLink() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
      >
        Acceder
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-52 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
          <a
            href={`${DASHBOARD_URL}/login`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">🏪</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Soy comercio</p>
              <p className="text-xs text-gray-400">Acceder al panel</p>
            </div>
          </a>
          <div className="border-t border-gray-100" />
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">👤</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Soy cliente</p>
              <p className="text-xs text-gray-400">Acceder a mi cuenta</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
