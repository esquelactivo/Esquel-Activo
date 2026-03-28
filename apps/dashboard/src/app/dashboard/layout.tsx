import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { BottomNav, Sidebar } from '@/components/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')

  // Obtener el tenant del usuario logueado
  const tenantSlug = session.user.tenantSlug
  const tenant = tenantSlug
    ? await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { name: true, brandName: true, primaryColor: true, logoUrl: true },
      })
    : null

  const tenantName = tenant?.brandName ?? tenant?.name ?? 'Mi negocio'

  return (
    <div
      className="flex min-h-screen bg-gray-50"
      style={{ '--color-primary': tenant?.primaryColor ?? '#0f2c32' } as React.CSSProperties}
    >
      {/* Sidebar — solo desktop */}
      <Sidebar tenantName={tenantName} logoUrl={tenant?.logoUrl ?? null} />

      {/* Contenido principal */}
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        {/* Header mobile */}
        <div className="sticky top-0 z-40 border-b border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            {tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenantName}
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <p className="text-sm font-bold text-gray-900">{tenantName}</p>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Bottom Nav — solo mobile */}
      <BottomNav />
    </div>
  )
}
