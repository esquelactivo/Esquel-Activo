import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ notifications: [], unread: 0 })

  const userId = (session.user as any).id as string

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { select: { tenantId: true } } },
  })

  if (!user) return NextResponse.json({ notifications: [], unread: 0 })

  const hasBusinessMemberships = user.memberships.length > 0
  const tenantIds = user.memberships.map(m => m.tenantId)

  const orConditions: any[] = [
    { targetType: 'ALL' },
    { targetType: 'USER', userId },
  ]
  if (!hasBusinessMemberships) orConditions.push({ targetType: 'CLIENTS' })
  if (hasBusinessMemberships) orConditions.push({ targetType: 'BUSINESSES' })
  if (tenantIds.length > 0) orConditions.push({ targetType: 'TENANT', tenantId: { in: tenantIds } })

  const allNotifications = await prisma.notification.findMany({
    where: { OR: orConditions },
    include: { reads: { where: { userId }, select: { id: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const notifications = allNotifications.map(n => ({
    id: n.id,
    title: n.title,
    body: n.body,
    imageUrl: n.imageUrl,
    createdAt: n.createdAt,
    isRead: n.reads.length > 0,
  }))

  const unread = notifications.filter(n => !n.isRead).length

  return NextResponse.json({ notifications, unread })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { notificationId } = await req.json()
  const userId = (session.user as any).id as string

  await prisma.notificationRead.upsert({
    where: { notificationId_userId: { notificationId, userId } },
    create: { notificationId, userId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}
