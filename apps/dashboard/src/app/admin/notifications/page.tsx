import { prisma } from '@esquel-activo/db'
import { NotificationComposer } from './NotificationComposer'
import { deleteNotification } from './actions'

export const metadata = { title: 'Notificaciones — Admin' }

const TARGET_LABELS: Record<string, string> = {
  ALL: 'Todos',
  CLIENTS: 'Clientes',
  BUSINESSES: 'Comercios',
  TENANT: 'Comercio específico',
  USER: 'Usuario específico',
}

const TARGET_COLORS: Record<string, string> = {
  ALL: 'bg-blue-900/50 text-blue-400',
  CLIENTS: 'bg-purple-900/50 text-purple-400',
  BUSINESSES: 'bg-orange-900/50 text-orange-400',
  TENANT: 'bg-green-900/50 text-green-400',
  USER: 'bg-gray-700 text-gray-300',
}

export default async function AdminNotificationsPage() {
  const [notifications, tenants, users] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reads: { select: { id: true } } },
    }),
    prisma.tenant.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }),
    prisma.user.findMany({ orderBy: { email: 'asc' }, select: { id: true, email: true, name: true } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="mt-1 text-sm text-gray-400">{notifications.length} enviadas</p>
        </div>
        <NotificationComposer tenants={tenants} users={users} />
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-700 bg-gray-800/30 py-16 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-400 text-sm">No hay notificaciones enviadas aún</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Notificación</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Destinatarios</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Leídas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {notifications.map((n) => (
                <tr key={n.id} className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      {n.imageUrl && (
                        <img src={n.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-xs">{n.body}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TARGET_COLORS[n.targetType] ?? 'bg-gray-700 text-gray-300'}`}>
                      {TARGET_LABELS[n.targetType]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-300">{n.reads.length}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-400 text-xs">
                      {new Date(n.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <form action={deleteNotification}>
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        onClick={e => { if (!confirm('¿Eliminar esta notificación?')) e.preventDefault() }}
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
