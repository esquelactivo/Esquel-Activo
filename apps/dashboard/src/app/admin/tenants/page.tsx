import { prisma } from '@esquel-activo/db'
import { toggleTenantActive } from './actions'

export const metadata = { title: 'Comercios — Admin' }

export default async function AdminTenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { memberships: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Comercios</h1>
          <p className="mt-1 text-sm text-gray-400">{tenants.length} comercios registrados</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Comercio</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuarios</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{tenant.name}</p>
                  {tenant.contactPhone && <p className="text-xs text-gray-500 mt-0.5">{tenant.contactPhone}</p>}
                </td>
                <td className="px-5 py-4 text-gray-400 font-mono text-xs">{tenant.slug}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400">{tenant._count.memberships}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tenant.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {tenant.isActive ? 'Activo' : 'Suspendido'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <form action={toggleTenantActive}>
                    <input type="hidden" name="tenantId" value={tenant.id} />
                    <input type="hidden" name="isActive" value={String(!tenant.isActive)} />
                    <button
                      type="submit"
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${tenant.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}`}
                    >
                      {tenant.isActive ? 'Suspender' : 'Activar'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
