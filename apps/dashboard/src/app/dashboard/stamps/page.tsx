import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { updateStampCard } from './actions'

export const metadata = { title: 'Tarjeta de sellos' }

export default async function StampsPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')

  let card = null
  let totalUsers = 0

  try {
    card = await prisma.stampCard.findFirst({
      where: { tenantId: session.user.tenantId },
      include: { _count: { select: { userCards: true } } },
    })
    if (card) {
      totalUsers = card._count.userCards
    }
  } catch {
    return (
      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6 text-center">
        <p className="text-sm text-orange-700">Las tablas de sellos aún no están creadas. Aplicá la migración SQL.</p>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Tarjeta de sellos</h1>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center space-y-3">
          <p className="text-4xl">🎯</p>
          <p className="text-sm font-medium text-gray-700">Todavía no creaste tu tarjeta de sellos</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Con la tarjeta de sellos, tus clientes acumulan sellos en cada visita y canjeán premios cuando la completan.
          </p>
          <Link
            href="/dashboard/stamps/new"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Crear tarjeta de sellos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Tarjeta de sellos</h1>
        <Link
          href="/dashboard/stamps/scan"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <span>📷</span> Validar sello
        </Link>
      </div>

      {/* Preview de la tarjeta */}
      <div
        className="rounded-2xl p-5 text-white space-y-4"
        style={{ background: card.color ?? 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Tarjeta de sellos</p>
            <p className="text-xl font-bold mt-0.5">{card.name}</p>
            {card.description && <p className="text-sm opacity-70 mt-1">{card.description}</p>}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${card.isActive ? 'bg-white/20' : 'bg-black/30'}`}>
            {card.isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: card.totalStamps }).map((_, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center text-lg"
            >
              ⭐
            </div>
          ))}
        </div>
        <p className="text-sm opacity-80">🎁 Premio: {card.reward}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          <p className="text-xs text-gray-400 mt-0.5">Clientes con tarjeta</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{card.totalStamps}</p>
          <p className="text-xs text-gray-400 mt-0.5">Sellos para completar</p>
        </div>
      </div>

      {/* Editar */}
      <StampCardEditForm card={card} />
    </div>
  )
}

function StampCardEditForm({ card }: { card: { id: string; name: string; description: string | null; totalStamps: number; reward: string; color: string | null; isActive: boolean } }) {
  return (
    <details className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <summary className="px-5 py-4 text-sm font-medium text-gray-700 cursor-pointer select-none">
        Editar configuración
      </summary>
      <form
        action={async (fd) => {
          'use server'
          await updateStampCard(card.id, fd)
        }}
        className="px-5 pb-5 space-y-4"
      >
        <input type="hidden" name="isActive" value={card.isActive ? 'true' : 'false'} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <input name="name" defaultValue={card.name} required className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Descripción</label>
          <input name="description" defaultValue={card.description ?? ''} className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-gray-700">Sellos para completar</label>
            <input name="totalStamps" type="number" min={2} max={50} defaultValue={card.totalStamps} required className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-gray-700">Color de acento</label>
            <input name="color" defaultValue={card.color ?? ''} placeholder="#e94560" className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Premio al completar</label>
          <input name="reward" defaultValue={card.reward} required placeholder="ej: 1 café gratis" className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          Guardar cambios
        </button>
      </form>
    </details>
  )
}
