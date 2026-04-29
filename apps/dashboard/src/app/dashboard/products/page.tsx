import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@esquel-activo/db'
import { ProductList } from '@/components/ProductList'

export const metadata = { title: 'Productos' }

export default async function ProductsPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')

  const products = await prisma.product.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    include: { category: { select: { name: true } } },
  })

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrls: p.imageUrls,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    price: p.price.toString(),
    discountPrice: p.discountPrice?.toString() ?? null,
    categoryId: p.categoryId,
    category: p.category,
  }))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Productos</h1>
      <ProductList products={serialized} />
    </div>
  )
}
