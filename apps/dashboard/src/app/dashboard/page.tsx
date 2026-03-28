import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'

export const metadata = { title: 'Inicio' }

export default async function DashboardHomePage() {
  const session = await auth()
  const tenantSlug = session?.user?.tenantSlug

  const [tenant, productCount] = await Promise.all([
    tenantSlug
      ? prisma.tenant.findUnique({
          where: { slug: tenantSlug },
          select: { schemaName: true, name: true, brandName: true },
        })
      : null,
    prisma.product.count({ where: { isActive: true } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Saludo */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Buen día 👋</h1>
        <p className="mt-0.5 text-sm text-gray-500">{tenant?.brandName ?? tenant?.name}</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Pedidos hoy" value="0" icon="📦" />
        <StatCard label="Pendientes" value="0" icon="⏳" />
        <StatCard label="Productos" value={String(productCount)} icon="🛍️" className="col-span-2 md:col-span-1" />
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-500">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction href="/dashboard/products" label="Agregar producto" icon="➕" />
          <QuickAction href="/dashboard/orders" label="Ver pedidos" icon="📋" />
          <QuickAction href="/dashboard/settings" label="Configurar negocio" icon="⚙️" />
          <QuickAction href="/dashboard/settings#whatsapp" label="Configurar WhatsApp" icon="💬" />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  className = '',
}: {
  label: string
  value: string
  icon: string
  className?: string
}) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 ${className}`}>
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  )
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-colors hover:bg-gray-50 active:scale-95"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  )
}

function StatCard({
  label,
  value,
  icon,
  className = '',
}: {
  label: string
  value: string
  icon: string
  className?: string
}) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 ${className}`}>
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  )
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-colors hover:bg-gray-50 active:scale-95"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  )
}
