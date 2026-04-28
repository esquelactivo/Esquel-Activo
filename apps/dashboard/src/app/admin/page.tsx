import { prisma } from '@esquel-activo/db'

export const metadata = { title: 'Panel Super Admin' }

export default async function AdminPage() {
  const [tenantCount, userCount, productCount, activeTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.tenant.count({ where: { isActive: true } }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
        <p className="mt-1 text-sm text-gray-400">Vista general de la plataforma Esquel Activo</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Comercios totales" value={String(tenantCount)} icon="🏪" />
        <StatCard label="Comercios activos" value={String(activeTenants)} icon="✅" />
        <StatCard label="Usuarios" value={String(userCount)} icon="👥" />
        <StatCard label="Productos" value={String(productCount)} icon="🛍️" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <QuickLink href="/admin/tenants" title="Gestionar comercios" description="Ver, activar, suspender y editar todos los comercios de la plataforma." icon="🏪" />
        <QuickLink href="/admin/users" title="Gestionar usuarios" description="Ver, crear, editar y suspender usuarios de todos los comercios." icon="👥" />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-gray-800 border border-gray-700 p-5">
      <p className="text-2xl">{icon}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{label}</p>
    </div>
  )
}

function QuickLink({ href, title, description, icon }: { href: string; title: string; description: string; icon: string }) {
  return (
    <a href={href} className="rounded-2xl bg-gray-800 border border-gray-700 p-6 hover:border-orange-500 transition-colors group">
      <p className="text-2xl">{icon}</p>
      <p className="mt-3 text-base font-semibold text-white group-hover:text-orange-400 transition-colors">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </a>
  )
}
