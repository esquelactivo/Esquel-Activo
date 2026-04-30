'use client'

import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { redeemQrCode } from '../actions'

const QrCameraScanner = dynamic(
  () => import('./QrCameraScanner').then(m => m.QrCameraScanner),
  { ssr: false }
)

type Result = {
  success: boolean
  error?: string
  userName?: string
  currentStamps?: number
  totalStamps?: number
  completed?: boolean
}

export default function ScanStampPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function submit(codeToSubmit: string) {
    if (!codeToSubmit.trim() || codeToSubmit.length < 4) return
    setResult(null)
    startTransition(async () => {
      const res = await redeemQrCode(codeToSubmit.trim())
      const completed = res.success && res.currentStamps === res.totalStamps
      setResult({ ...res, completed })
      setCode('')
      inputRef.current?.focus()
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit(code)
  }

  function handleQrDetected(detectedCode: string) {
    setShowCamera(false)
    setCode(detectedCode)
    submit(detectedCode)
  }

  const isCompleted = result?.success && result.completed

  return (
    <>
      {showCamera && (
        <QrCameraScanner
          onDetected={handleQrDetected}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="space-y-6 max-w-sm mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/stamps')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Validar sello</h1>
            <p className="text-sm text-gray-500">Escaneá el QR o ingresá el código</p>
          </div>
        </div>

        {/* Camera scan button */}
        <button
          onClick={() => setShowCamera(true)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <span className="text-xl">📷</span>
          Escanear QR del cliente
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-100" />
          <span className="text-xs text-gray-400">o ingresá el código</span>
          <div className="flex-1 border-t border-gray-100" />
        </div>

        {/* Manual code entry */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-2 items-center">
              <p className="text-sm font-medium text-gray-700">Código de 6 dígitos</p>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-4xl font-mono tracking-[0.4em] w-full rounded-2xl border-2 border-gray-200 px-4 py-5 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || code.length < 4}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isPending ? 'Validando...' : 'Dar sello'}
            </button>
          </div>
        </form>

        {/* Result feedback */}
        {result && (
          <div className={`rounded-2xl p-6 text-center space-y-2 ${
            result.success
              ? isCompleted
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <>
                <p className="text-3xl">{isCompleted ? '🎉' : '✅'}</p>
                <p className={`text-lg font-bold ${isCompleted ? 'text-amber-800' : 'text-green-800'}`}>
                  {isCompleted ? '¡Tarjeta completada!' : 'Sello agregado'}
                </p>
                <p className={`text-sm ${isCompleted ? 'text-amber-700' : 'text-green-700'}`}>
                  {result.userName}
                </p>
                {isCompleted ? (
                  <p className="text-sm font-medium text-amber-800">
                    Este cliente completó su tarjeta y puede canjear su premio.
                  </p>
                ) : (
                  <p className={`text-sm ${isCompleted ? 'text-amber-700' : 'text-green-700'}`}>
                    {result.currentStamps} / {result.totalStamps} sellos
                  </p>
                )}
                <div className="mt-3 h-2 rounded-full bg-white/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isCompleted ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${((result.currentStamps ?? 0) / (result.totalStamps ?? 1)) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl">❌</p>
                <p className="text-sm font-medium text-red-700">{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
