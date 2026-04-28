import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@esquel-activo/db'
import { hash } from 'bcryptjs'

// Endpoint de uso único para crear el admin de plataforma.
// Protegido con token para evitar uso no autorizado.
// Eliminar este archivo después de crear el usuario.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const secret = process.env.SETUP_SECRET

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const passwordHash = await hash('EsquelAdmin2024!', 10)

    const user = await prisma.user.upsert({
      where: { email: 'fabri.webmaster@gmail.com' },
      update: { passwordHash },
      create: {
        email: 'fabri.webmaster@gmail.com',
        name: 'Fabri Admin',
        passwordHash,
      },
    })

    const tenants = await prisma.tenant.findMany({ select: { id: true, slug: true } })

    for (const tenant of tenants) {
      await prisma.tenantMembership.upsert({
        where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
        update: { role: 'OWNER' },
        create: { userId: user.id, tenantId: tenant.id, role: 'OWNER' },
      })
    }

    return NextResponse.json({
      ok: true,
      message: `Usuario creado con acceso a ${tenants.length} tenant(s)`,
      email: user.email,
      tenants: tenants.map(t => t.slug),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
