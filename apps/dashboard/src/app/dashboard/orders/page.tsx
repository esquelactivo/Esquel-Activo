import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { OrderCard } from './OrderCard'
import { OrdersRefresher } from './OrdersRefresher'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pedidos' }

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  SHIPPED: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.tenantId) return null

  const orders = await prisma.order.findMany({
    where: { tenantId: session.user.tenantId },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
          variant: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  // Serializar decimals
  const serialized = orders.map(o => ({
    ...o,
    total: o.total.toString(),
    subtotal: o.subtotal.toString(),
    shipping: o.shipping.toString(),
    items: o.items.map(i => ({
      ...i,
      unitPrice: i.unitPrice.toString(),
    })),
  }))

  // Agrupar activos vs archivados
  const active = serialized.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const archived = serialized.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status))

  // Stats rápidas
  const pendingCount = serialized.filter(o => o.status === 'PENDING').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
        {pendingCount > 0 && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
            {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <OrdersRefresher />

      {serialized.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-semibold text-gray-700">No hay pedidos aún</p>
          <p className="mt-1 text-sm text-gray-400">
            Cuando llegue un pedido lo vas a ver acá
          </p>
        </div>
      ) : (
        <>
          {/* Pedidos activos */}
          {active.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Activos ({active.length})
              </h2>
              {active.map(order => (
                <OrderCard key={order.id} order={order as any} />
              ))}
            </section>
          )}

          {/* Pedidos archivados */}
          {archived.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Historial ({archived.length})
              </h2>
              {archived.map(order => (
                <OrderCard key={order.id} order={order as any} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
