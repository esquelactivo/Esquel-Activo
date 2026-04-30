'use client'

import { useState, useEffect, useCallback } from 'react'

interface QrModalProps {
  onClose: () => void
}

export function QrModal({ onClose }: QrModalProps) {
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/qr/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al generar el código')
        return
      }
      setCode(data.code)
      const exp = new Date(data.expiresAt)
      setExpiresAt(exp)
      setSecondsLeft(Math.floor((exp.getTime() - Date.now()) / 1000))
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    generate()
  }, [generate])

  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left === 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const expired = secondsLeft === 0 && code !== null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Tu código de sello</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {loading && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">Generando código…</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={generate}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && code && (
          <div className="space-y-5 text-center">
            <div className={`rounded-2xl px-6 py-8 ${expired ? 'bg-gray-100' : 'bg-gray-50'}`}>
              <p className={`text-6xl font-mono font-bold tracking-[0.15em] ${expired ? 'text-gray-300' : 'text-gray-900'}`}>
                {code}
              </p>
            </div>

            {expired ? (
              <div className="space-y-3">
                <p className="text-sm text-red-500">Este código expiró</p>
                <button
                  onClick={generate}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  Generar nuevo código
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-2xl font-mono font-semibold text-gray-700">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <p className="text-xs text-gray-400">Mostráselo al comercio antes de que expire</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
