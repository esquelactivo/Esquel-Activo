import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { PostForm } from '../../PostForm'

export const metadata = { title: 'Editar publicación' }

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) redirect('/login')

  const { id } = await params
  const post = await prisma.post.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: { values: true },
  })

  if (!post) notFound()

  const postType = await prisma.postType.findUnique({
    where: { id: post.postTypeId },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!postType) notFound()

  const serializedPost = {
    id: post.id,
    title: post.title,
    isPublished: post.isPublished,
    values: post.values.map(v => ({ fieldKey: v.fieldKey, value: v.value })),
  }

  const serializedType = {
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
          Editar {postType.name}
        </h1>
      </div>
      <PostForm postType={serializedType} post={serializedPost} />
    </div>
  )
}
