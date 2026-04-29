import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@esquel-activo/db'
import { ProductForm } from '@/components/ProductForm'
import { VariantSection } from '../../VariantSection'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'Editar producto' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')

  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { id, tenantId: session.user.tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discountPrice: true,
        isFeatured: true,
        categoryId: true,
        imageUrls: true,
      },
    }),
    prisma.category.findMany({
      where: { tenantId: session.user.tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!product) notFound()

  const serialized = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    discountPrice: product.discountPrice?.toString() ?? null,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId,
    imageUrls: product.imageUrls,
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Editar producto</h1>
      </div>

      <ProductForm categories={categories} product={serialized} />

      <VariantSection productId={product.id} productName={product.name} />
    </div>
  )
}
