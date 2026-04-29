import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@esquel-activo/db'
import { CategoryManager } from './CategoryManager'

export const metadata = { title: 'Categorías' }

export default async function CategoriesPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')

  const categories = await prisma.category.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
        <p className="mt-1 text-sm text-gray-400">
          Organizá tu catálogo en categorías para que tus clientes encuentren lo que buscan más fácil.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  )
}
