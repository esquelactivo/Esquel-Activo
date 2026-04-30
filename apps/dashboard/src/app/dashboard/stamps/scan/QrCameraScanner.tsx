'use client'

import { useEffect, useRef, useState } from 'react'

interface QrCameraScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export function QrCameraScanner({ onDetected, onClose }: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(true)
  const detectedRef = useRef(false)

  useEffect(() => {
    let qrScanner: { stop: () => void; destroy: () => void } | null = null

    async function start() {
      if (!videoRef.current) return
      try {
        const QrScanner = (await import('qr-scanner')).default
        qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (detectedRef.current) return
            // Extract digits only — handles both plain "123456" and encoded URLs
            const digits = result.data.replace(/\D/g, '').slice(-6)
            if (digits.length >= 4) {
              detectedRef.current = true
              setScanning(false)
              qrScanner?.stop()
              onDetected(digits)
            }
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )
        await qrScanner.start()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('permission') || msg.includes('NotAllowed')) {
          setError('Permiso de cámara denegado. Habilitalo en la configuración del navegador.')
        } else {
          setError('No se pudo acceder a la cámara.')
        }
      }
    }

    start()

    return () => {
      qrScanner?.stop()
      qrScanner?.destroy()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <p className="text-white font-medium text-sm">Escaneá el QR del cliente</p>
        <button onClick={onClose} className="text-white text-2xl leading-none px-2">×</button>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-medium"
          >
            Usar código manual
          </button>
        </div>
      ) : (
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
          />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-white/60 rounded-2xl relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>
          )}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white/70 text-xs">Apuntá al código QR del cliente</p>
          </div>
        </div>
      )}
    </div>
  )
}
