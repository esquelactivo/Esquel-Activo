import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { getCurrentTenant } from '@/lib/tenant'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const tenant = await getCurrentTenant()
  if (!tenant) {
    return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
  }

  const userId = (session.user as { id: string }).id
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

  // Generar código único de 6 dígitos
  let code = ''
  let attempts = 0
  while (attempts < 5) {
    code = String(Math.floor(100000 + Math.random() * 900000))
    const existing = await prisma.qrToken.findUnique({ where: { code } })
    if (!existing) break
    attempts++
  }

  if (!code) {
    return NextResponse.json({ error: 'No se pudo generar el código' }, { status: 500 })
  }

  await prisma.qrToken.create({
    data: {
      userId,
      tenantId: tenant.id,
      type: 'STAMP',
      code,
      expiresAt,
    },
  })

  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() })
}
