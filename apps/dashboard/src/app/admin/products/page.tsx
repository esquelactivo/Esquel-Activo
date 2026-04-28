import { prisma } from '@esquel-activo/db'
import { ProductAuditList } from './ProductAuditList'

export const metadata = { title: 'Productos — Admin' }

export default async function AdminProductsPage() {
  const [productsRaw, tenants] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
      },
    }),
    prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, primaryColor: true },
    }),
  ])

  // Enriquecer cada producto con datos del tenant
  const tenantMap = new Map(tenants.map(t => [t.id, t]))

  const products = productsRaw.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price.toString(),
    discountPrice: p.discountPrice?.toString() ?? null,
    imageUrls: p.imageUrls,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    createdAt: p.createdAt.toISOString(),
    category: p.category,
    tenant: tenantMap.get(p.tenantId) ?? { id: p.tenantId, name: 'Desconocido', slug: '', primaryColor: '#666' },
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <p className="mt-1 text-sm text-gray-400">{products.length} productos en total entre todos los comercios</p>
      </div>

      <ProductAuditList products={products} tenants={tenants} />
    </div>
  )
}
