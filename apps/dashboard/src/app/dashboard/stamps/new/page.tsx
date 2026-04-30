'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStampCard } from '../actions'

export default function NewStampCardPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [totalStamps, setTotalStamps] = useState(10)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createStampCard(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Nueva tarjeta de sellos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Solo podés tener una tarjeta activa por comercio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Nombre de la tarjeta</label>
          <input
            name="name"
            required
            placeholder="ej: Tarjeta de café"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
          <input
            name="description"
            placeholder="ej: Juntá sellos en cada compra"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-gray-700">Sellos para completar</label>
            <input
              name="totalStamps"
              type="number"
              min={2}
              max={50}
              value={totalStamps}
              onChange={e => setTotalStamps(parseInt(e.target.value) || 10)}
              required
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-gray-700">Color de acento</label>
            <input
              name="color"
              placeholder="#e94560"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Preview de sellos */}
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400 mb-3">Vista previa de sellos</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: Math.min(totalStamps, 20) }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-sm">
                ⭐
              </div>
            ))}
            {totalStamps > 20 && <span className="text-xs text-gray-400 self-center">+{totalStamps - 20} más</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Premio al completar</label>
          <input
            name="reward"
            required
            placeholder="ej: 1 café gratis"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/stamps')}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? 'Creando...' : 'Crear tarjeta'}
          </button>
        </div>
      </form>
    </div>
  )
}
