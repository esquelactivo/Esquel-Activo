import { prisma } from '@esquel-activo/db'
import { UserManagement } from './UserManagement'

export const metadata = { title: 'Usuarios — Admin' }

export default async function AdminUsersPage() {
  const [users, tenants] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        memberships: {
          include: { tenant: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const serialized = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    isSuperAdmin: u.isSuperAdmin,
    isActive: !!u.passwordHash,
    createdAt: u.createdAt.toISOString(),
    memberships: u.memberships.map((m) => ({
      id: m.id,
      role: m.role,
      tenant: m.tenant,
    })),
  }))

  return <UserManagement users={serialized} tenants={tenants} />
}
