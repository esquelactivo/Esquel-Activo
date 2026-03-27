import { getCurrentTenant } from '@/lib/tenant'

export default async function MarketplacePage() {
  const tenant = await getCurrentTenant()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary">
        {tenant ? `Tienda — ${tenant.brandName}` : 'Marketplace'}
      </h1>
      <p className="mt-2 text-gray-500">
        {/* Los productos se cargarán en la Fase 2 */}
        Catálogo de productos — próximamente
      </p>
    </main>
  )
}
