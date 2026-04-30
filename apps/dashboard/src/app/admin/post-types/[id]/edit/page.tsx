import { notFound } from 'next/navigation'
import { prisma } from '@esquel-activo/db'
import { PostTypeForm } from '../../PostTypeForm'

export const metadata = { title: 'Editar tipo de contenido — Admin' }

export default async function EditPostTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postType = await prisma.postType.findUnique({
    where: { id },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!postType) notFound()

  const serialized = {
    ...postType,
    fields: postType.fields.map(f => ({
      id: f.id,
      name: f.name,
      key: f.key,
      type: f.type,
      required: f.required,
      placeholder: f.placeholder ?? '',
      sortOrder: f.sortOrder,
    })),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Editar tipo: {postType.name}</h1>
        <p className="mt-1 text-sm text-gray-400">
          Modificá los campos del tipo. Los posts existentes conservarán sus valores.
        </p>
      </div>
      <PostTypeForm postType={serialized} />
    </div>
  )
}
