import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@esquel-activo/db'

export const metadata = { title: 'Notificaciones' }

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = (session.user as any).id as string

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { select: { tenantId: true } } },
  })

  const hasBusinessMemberships = (user?.memberships?.length ?? 0) > 0
  const tenantIds = user?.memberships?.map(m => m.tenantId) ?? []

  const orConditions: any[] = [
    { targetType: 'ALL' },
    { targetType: 'USER', userId },
  ]
  if (!hasBusinessMemberships) orConditions.push({ targetType: 'CLIENTS' })
  if (hasBusinessMemberships) orConditions.push({ targetType: 'BUSINESSES' })
  if (tenantIds.length > 0) orConditions.push({ targetType: 'TENANT', tenantId: { in: tenantIds } })

  const notifications = await prisma.notification.findMany({
    where: { OR: orConditions },
    include: { reads: { where: { userId }, select: { id: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Marcar todas como leídas
  const unreadIds = notifications.filter(n => n.reads.length === 0).map(n => n.id)
  if (unreadIds.length > 0) {
    await prisma.notificationRead.createMany({
      data: unreadIds.map(notificationId => ({ notificationId, userId })),
      skipDuplicates: true,
    })
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-24 px-4">
      <div className="mx-auto max-w-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Notificaciones</h1>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-5xl">🔔</span>
            <p className="text-gray-500 text-sm">No tenés notificaciones todavía</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const isRead = n.reads.length > 0 || unreadIds.includes(n.id)
              return (
                <div
                  key={n.id}
                  className={`rounded-2xl p-4 border ${isRead ? 'border-gray-100 bg-white' : 'border-primary/20 bg-primary/5'}`}
                >
                  <div className="flex gap-3">
                    {n.imageUrl && (
                      <img src={n.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(n.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
