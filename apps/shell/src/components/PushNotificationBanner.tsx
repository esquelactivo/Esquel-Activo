'use client'

import { useEffect, useState } from 'react'
import { usePushNotifications } from '@/context/PushNotificationsContext'

const DISMISSED_KEY = 'push-banner-dismissed'

export function PushNotificationBanner() {
  const { state, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(true) // oculto inicialmente para evitar flash

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === '1')
  }, [])

  // Auto-dismiss cuando el estado pasa a 'subscribed' (ej: ya tenía permisos)
  useEffect(() => {
    if (state === 'subscribed') {
      localStorage.setItem(DISMISSED_KEY, '1')
      setDismissed(true)
    }
  }, [state])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || state === 'loading' || state === 'subscribed' || state === 'denied' || state === 'unsupported') {
    return null
  }

  if (state === 'ios-needs-pwa') {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl bg-gray-900 text-white p-4 shadow-xl flex gap-3 items-start">
        <span className="text-2xl shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Activá las notificaciones</p>
          <p className="text-xs text-gray-300 mt-0.5">
            En iOS, tocá <strong>Compartir → Agregar a pantalla de inicio</strong> y abrí la app desde ahí.
          </p>
        </div>
        <button onClick={dismiss} className="text-gray-400 hover:text-white text-xl leading-none shrink-0">×</button>
      </div>
    )
  }

  // state === 'unsubscribed'
  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl bg-gray-900 text-white p-4 shadow-xl flex gap-3 items-center">
      <span className="text-2xl shrink-0">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">¿Activar notificaciones?</p>
        <p className="text-xs text-gray-300 mt-0.5">Enterate de las novedades y promos.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={dismiss}
          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
        >
          Ahora no
        </button>
        <button
          onClick={async () => {
            const ok = await subscribe()
            if (ok) dismiss() // solo dismissea si la suscripción fue exitosa
          }}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
        >
          Activar
        </button>
      </div>
    </div>
  )
}
