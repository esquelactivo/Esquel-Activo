'use client'

import { useState, useTransition } from 'react'
import { createNotification } from './actions'

type Tenant = { id: string; name: string; slug: string }
type User = { id: string; email: string; name: string | null }

const TARGET_OPTIONS = [
  { value: 'ALL', label: 'Todos (clientes + comercios)', icon: '🌐' },
  { value: 'CLIENTS', label: 'Solo clientes', icon: '👤' },
  { value: 'BUSINESSES', label: 'Solo comercios', icon: '🏪' },
  { value: 'TENANT', label: 'Un comercio específico', icon: '📍' },
  { value: 'USER', label: 'Un usuario específico', icon: '🎯' },
]

export function NotificationComposer({ tenants, users }: { tenants: Tenant[]; users: User[] }) {
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState('ALL')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createNotification(formData)
      if (result.success) {
        setOpen(false)
        setTarget('ALL')
        ;(e.target as HTMLFormElement).reset()
      } else {
        setError(result.error ?? 'Error')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
      >
        + Nueva notificación
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-lg rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Nueva notificación</h2>
              <button onClick={() => { setOpen(false); setError(null) }} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Título</label>
                <input
                  name="title"
                  required
                  placeholder="Ej: ¡Nueva oferta disponible!"
                  className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Mensaje */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Mensaje</label>
                <textarea
                  name="body"
                  required
                  rows={3}
                  placeholder="Escribí el contenido de la notificación..."
                  className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              {/* Imagen (URL) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Imagen (URL, opcional)</label>
                <input
                  name="imageUrl"
                  type="url"
                  placeholder="https://..."
                  className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Destinatarios */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Destinatarios</label>
                <select
                  name="targetType"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {TARGET_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comercio específico */}
              {target === 'TENANT' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">Comercio</label>
                  <select
                    name="tenantId"
                    required
                    className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Seleccioná un comercio</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {/* Usuario específico */}
              {target === 'USER' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">Usuario</label>
                  <select
                    name="userId"
                    required
                    className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Seleccioná un usuario</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name ?? u.email}</option>)}
                  </select>
                </div>
              )}

              {error && <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(null) }}
                  className="flex-1 py-2 rounded-xl border border-gray-600 text-gray-300 text-sm hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
                >
                  {isPending ? 'Enviando...' : 'Enviar notificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
