import { getCurrentTenant } from '@/lib/tenant'

export default async function DashboardPage() {
  const tenant = await getCurrentTenant()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary">
        {tenant ? `Panel — ${tenant.brandName}` : 'Panel de Gestión'}
      </h1>
      <p className="mt-2 text-gray-500">
        {/* Métricas y pedidos en tiempo real — Fase 3 */}
        Panel de control — próximamente
      </p>
    </main>
  )
}
