'use client'

import { useEffect, useState } from 'react'

export function ShellLink({ tenantSlug }: { tenantSlug: string }) {
  const [href, setHref] = useState(`http://localhost:3000/?tenant=${tenantSlug}`)

  useEffect(() => {
    setHref(`http://${window.location.hostname}:3000/?tenant=${tenantSlug}`)
  }, [tenantSlug])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
    >
      Ver mi local
      <ExternalIcon />
    </a>
  )
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
