import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { getCurrentTenant } from '@/lib/tenant'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { endpoint, p256dh, auth: authKey } = body

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const session = await auth()
  const tenant = await getCurrentTenant()
  const userId = session?.user ? (session.user as { id: string }).id : null

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      endpoint,
      p256dh,
      auth: authKey,
      userId,
      tenantId: tenant?.id ?? null,
    },
    update: {
      p256dh,
      auth: authKey,
      userId,
      tenantId: tenant?.id ?? null,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { endpoint } = body

  if (!endpoint) return NextResponse.json({ error: 'endpoint requerido' }, { status: 400 })

  await prisma.pushSubscription.deleteMany({ where: { endpoint } })

  return NextResponse.json({ ok: true })
}
