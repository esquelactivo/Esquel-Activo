'use client'

import { useEffect, useState } from 'react'

export function LoginLink() {
  const [href, setHref] = useState('http://localhost:3002/login')

  useEffect(() => {
    setHref(`http://${window.location.hostname}:3002/login`)
  }, [])

  return (
    <a
      href={href}
      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
    >
      Acceder
    </a>
  )
}
