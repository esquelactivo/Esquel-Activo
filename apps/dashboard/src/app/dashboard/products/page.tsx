import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@esquel-activo/db'
import { ProductList } from '@/components/ProductList'

export const metadata = { title: 'Productos' }

export default async function ProductsPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')

  const tenantId = session.user.tenantId

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  // Prisma devuelve Decimal — lo convertimos a string para pasar al cliente
  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrls: p.imageUrls,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    price: p.price.toString(),
    discountPrice: p.discountPrice?.toString() ?? null,
    categoryId: p.categoryId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    category: p.category,
  }))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Productos</h1>
      <ProductList products={serialized} categories={categories} />
    </div>
  )
}
