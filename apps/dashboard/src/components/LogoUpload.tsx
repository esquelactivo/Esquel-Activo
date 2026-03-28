'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadLogo } from '@/actions/upload-logo'

interface LogoUploadProps {
  currentLogoUrl: string | null
  tenantName: string
}

export function LogoUpload({ currentLogoUrl, tenantName }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(false)

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const formData = new FormData()
    formData.append('image', file)

    startTransition(async () => {
      const result = await uploadLogo(formData)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error ?? 'Error desconocido')
        setPreview(null)
      }
      // Reset input so same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  const displayUrl = preview ?? currentLogoUrl

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo display */}
      <div
        className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary/50 hover:bg-primary/5"
        onClick={() => !isPending && inputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`Logo de ${tenantName}`}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <ImageIcon />
            <span className="text-xs">Sin logo</span>
          </div>
        )}

        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
            <Spinner />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />

      {/* Button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? 'Subiendo...' : currentLogoUrl ? 'Cambiar logo' : 'Subir logo'}
      </button>

      <p className="text-center text-xs text-gray-400">
        PNG, JPG o SVG · Máx. 5 MB · Se recomienda fondo transparente
      </p>

      {error && (
        <p className="w-full rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="w-full rounded-xl bg-green-50 px-3 py-2 text-center text-sm text-green-700">
          Logo actualizado correctamente
        </p>
      )}
    </div>
  )
}

function ImageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
  )
}
