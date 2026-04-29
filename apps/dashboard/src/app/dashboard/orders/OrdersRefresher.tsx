'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function OrdersRefresher({ pendingCount }: { pendingCount: number }) {
  const router = useRouter()
  const prevCount = useRef<number | null>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30_000)
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      prevCount.current = pendingCount
      return
    }
    if (prevCount.current !== null && pendingCount > prevCount.current) {
      playBeep()
    }
    prevCount.current = pendingCount
  }, [pendingCount])

  useEffect(() => {
    const base = 'Panel de gestión'
    document.title = pendingCount > 0 ? `(${pendingCount}) Pedidos — ${base}` : base
    return () => { document.title = base }
  }, [pendingCount])

  return null
}

function playBeep() {
  try {
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(); osc.stop(ctx.currentTime + 0.4)
    setTimeout(() => ctx.close(), 600)
  } catch {}
}
