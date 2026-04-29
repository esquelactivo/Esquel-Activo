import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@esquel-activo/db'
import { ProductForm } from '@/components/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'Nuevo producto' }

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')

  const categories = await prisma.category.findMany({
    where: { tenantId: session.user.tenantId, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nuevo producto</h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
