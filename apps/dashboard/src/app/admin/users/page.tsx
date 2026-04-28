import { prisma } from '@esquel-activo/db'
import { toggleUserActive } from './actions'

export const metadata = { title: 'Usuarios — Admin' }

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      memberships: {
        include: { tenant: { select: { name: true, slug: true } } },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-400">{users.length} usuarios registrados</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Comercios</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Creado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {users.map((user) => (
              <tr key={user.id} className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{user.name ?? '—'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.memberships.length === 0 && <span className="text-gray-600 text-xs">Sin comercio</span>}
                    {user.memberships.map((m) => (
                      <span key={m.id} className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
                        {m.tenant.name} · {m.role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {user.isSuperAdmin ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-400">Super Admin</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">Comercio</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString('es-AR')}
                </td>
                <td className="px-5 py-4">
                  {!user.isSuperAdmin && (
                    <form action={toggleUserActive}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="hasPassword" value={String(!!user.passwordHash)} />
                      <button
                        type="submit"
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${user.passwordHash ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}`}
                      >
                        {user.passwordHash ? 'Suspender' : 'Reactivar'}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
