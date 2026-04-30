'use client'

import { useState, useEffect, useCallback } from 'react'

export type PushState = 'unsupported' | 'ios-needs-pwa' | 'loading' | 'denied' | 'subscribed' | 'unsubscribed'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      // iOS Safari sin PWA
      if (isIOS && !isStandalone) {
        setState('ios-needs-pwa')
      } else {
        setState('unsupported')
      }
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
        const perm = Notification.permission
        if (perm === 'denied') setState('denied')
        else setState('unsubscribed')
      }
    })
  }, [])

  const subscribe = useCallback(async () => {
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready

      // Get VAPID public key
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
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        }),
      })

      setState('subscribed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('denied') || Notification.permission === 'denied') {
        setState('denied')
        setError('Permiso denegado. Habilitá las notificaciones en la configuración del navegador.')
      } else {
        setError('No se pudo activar las notificaciones.')
      }
    }
  }, [])

  const unsubscribe = useCallback(async () => {
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

  return { state, error, subscribe, unsubscribe }
}
