import { notFound, redirect } from 'next/navigation'
import { prisma } from '@esquel-activo/db'
import { PostForm } from '../PostForm'

export const metadata = { title: 'Nueva publicación' }

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ typeId?: string }> }) {
  const { typeId } = await searchParams

  if (!typeId) redirect('/dashboard/posts')

  const postType = await prisma.postType.findFirst({
    where: { id: typeId, isActive: true },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!postType) notFound()

  const serialized = {
    ...postType,
    fields: postType.fields.map(f => ({
      ...f,
      placeholder: f.placeholder ?? null,
    })),
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {postType.icon && <span className="mr-2">{postType.icon}</span>}
          Nueva {postType.name}
        </h1>
      </div>
      <PostForm postType={serialized} />
    </div>
  )
}
