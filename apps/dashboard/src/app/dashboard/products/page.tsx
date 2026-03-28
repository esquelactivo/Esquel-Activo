import { prisma } from '@esquel-activo/db'
import { ProductList } from '@/components/ProductList'

export const metadata = { title: 'Productos' }

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  // Prisma devuelve Decimal — lo convertimos a string para pasar al cliente
  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    discountPrice: p.discountPrice?.toString() ?? null,
  }))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Productos</h1>
      <ProductList products={serialized} categories={categories} />
    </div>
  )
}
