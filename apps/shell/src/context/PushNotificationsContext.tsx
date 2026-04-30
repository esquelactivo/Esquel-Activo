'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type PushState = 'unsupported' | 'ios-needs-pwa' | 'loading' | 'denied' | 'subscribed' | 'unsubscribed'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buf = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) buf[i] = rawData.charCodeAt(i)
  return buf.buffer as ArrayBuffer
}

interface PushNotificationsContextValue {
  state: PushState
  error: string | null
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<void>
}

const PushNotificationsContext = createContext<PushNotificationsContextValue | null>(null)

export function PushNotificationsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PushState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState(isIOS && !isStandalone ? 'ios-needs-pwa' : 'unsupported')
      return
    }
    if (isIOS && !isStandalone) {
      setState('ios-needs-pwa')
      return
    }

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        setState('subscribed')
      } else {
        setState(Notification.permission === 'denied' ? 'denied' : 'unsubscribed')
      }
    })
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const keyRes = await fetch('/api/push/vapid-key')
      const { publicKey } = await keyRes.json()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }),
      })

      setState('subscribed')
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('denied') || Notification.permission === 'denied') {
        setState('denied')
        setError('Permiso denegado. Habilitá las notificaciones en la configuración del navegador.')
      } else {
        setError('No se pudo activar las notificaciones.')
      }
      return false
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<void> => {
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('unsubscribed')
    } catch {
      setError('Error al desactivar las notificaciones.')
    }
  }, [])

  return (
    <PushNotificationsContext.Provider value={{ state, error, subscribe, unsubscribe }}>
      {children}
    </PushNotificationsContext.Provider>
  )
}

export function usePushNotifications() {
  const ctx = useContext(PushNotificationsContext)
  if (!ctx) throw new Error('usePushNotifications must be used within PushNotificationsProvider')
  return ctx
}
