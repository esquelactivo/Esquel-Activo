import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const tenantId: string | undefined = body.tenantId

  if (!tenantId) {
    return NextResponse.json({ error: 'Comercio no especificado' }, { status: 400 })
  }

  const userId = (session.user as { id: string }).id
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // Generar código único de 6 dígitos
  let code = ''
  for (let attempts = 0; attempts < 5; attempts++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    const existing = await prisma.qrToken.findUnique({ where: { code: candidate } })
    if (!existing) { code = candidate; break }
  }

  if (!code) {
    return NextResponse.json({ error: 'No se pudo generar el código' }, { status: 500 })
  }

  await prisma.qrToken.create({
    data: { userId, tenantId, type: 'STAMP', code, expiresAt },
  })

  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() })
}
