'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from './actions'

type Status = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

const STATUS_LABEL: Record<Status, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  SHIPPED: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  READY: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

// Transiciones válidas por estado
const NEXT_ACTIONS: Record<Status, { label: string; status: Status }[]> = {
  PENDING: [
    { label: 'Confirmar', status: 'CONFIRMED' },
    { label: 'Cancelar', status: 'CANCELLED' },
  ],
  CONFIRMED: [
    { label: 'En preparación', status: 'PREPARING' },
    { label: 'Cancelar', status: 'CANCELLED' },
  ],
  PREPARING: [
    { label: 'Marcar listo', status: 'READY' },
    { label: 'Cancelar', status: 'CANCELLED' },
  ],
  READY: [
    { label: 'En camino', status: 'SHIPPED' },
    { label: 'Entregado', status: 'DELIVERED' },
  ],
  SHIPPED: [{ label: 'Entregado', status: 'DELIVERED' }],
  DELIVERED: [],
  CANCELLED: [],
}

type OrderItem = {
  id: string
  quantity: number
  unitPrice: string
  product: { name: string }
  variant: { name: string } | null
}

type Order = {
  id: string
  number: number
  status: Status
  customerName: string | null
  customerPhone: string | null
  total: string
  createdAt: Date
  items: OrderItem[]
}

export function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(status: Status) {
    startTransition(async () => {
      await updateOrderStatus(order.id, status)
    })
  }

  const actions = NEXT_ACTIONS[order.status]
  const timeAgo = formatTimeAgo(order.createdAt)

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* Cabecera */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg font-bold text-gray-900 shrink-0">#{order.number}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {order.customerName ?? 'Cliente anónimo'}
            </p>
            <p className="text-xs text-gray-400">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-sm font-bold text-gray-900">
            ${Number(order.total).toLocaleString('es-AR')}
          </span>
          <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-4 pt-3 flex flex-col gap-3">
          {/* Items */}
          <div className="flex flex-col gap-1.5">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.quantity}× {item.product.name}
                  {item.variant && <span className="text-gray-400"> ({item.variant.name})</span>}
                </span>
                <span className="text-gray-500">
                  ${(Number(item.unitPrice) * item.quantity).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          {/* Info del cliente */}
          {(order.customerName || order.customerPhone) && (
            <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
              {order.customerName && <p>Nombre: {order.customerName}</p>}
              {order.customerPhone && <p>Teléfono: {order.customerPhone}</p>}
            </div>
          )}

          {/* Acciones */}
          {actions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {actions.map(action => (
                <button
                  key={action.status}
                  onClick={() => handleStatusChange(action.status)}
                  disabled={isPending}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                    action.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isPending ? '...' : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora mismo'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}
