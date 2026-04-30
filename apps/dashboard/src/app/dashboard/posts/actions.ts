'use server'

import { prisma } from '@esquel-activo/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getTenantId() {
  const session = await auth()
  const tenantId = session?.user?.tenantId
  if (!tenantId) throw new Error('Sin tenant')
  return tenantId
}

export async function createPost(formData: FormData) {
  const tenantId = await getTenantId()
  const postTypeId = formData.get('postTypeId') as string
  const title = (formData.get('title') as string).trim()
  const isPublished = formData.get('isPublished') === 'true'
  const fieldValuesJson = formData.get('fieldValues') as string

  if (!title) return { error: 'El título es requerido' }

  const postType = await prisma.postType.findUnique({
    where: { id: postTypeId },
    select: { slug: true, name: true, fields: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!postType) return { error: 'Tipo de contenido no encontrado' }

  const fieldValues: Record<string, string> = fieldValuesJson ? JSON.parse(fieldValuesJson) : {}

  for (const field of postType.fields) {
    if (field.required && !fieldValues[field.key]?.trim()) {
      return { error: `El campo "${field.name}" es requerido` }
    }
  }

  await prisma.post.create({
    data: {
      tenantId,
      postTypeId,
      postTypeSlug: postType.slug,
      postTypeName: postType.name,
      title,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      values: {
        create: Object.entries(fieldValues)
          .filter(([, v]) => v?.trim())
          .map(([fieldKey, value]) => ({ fieldKey, value: value.trim() })),
      },
    },
  })

  revalidatePath('/dashboard/posts')
  redirect('/dashboard/posts')
}

export async function updatePost(id: string, formData: FormData) {
  const tenantId = await getTenantId()
  const title = (formData.get('title') as string).trim()
  const isPublished = formData.get('isPublished') === 'true'
  const fieldValuesJson = formData.get('fieldValues') as string

  if (!title) return { error: 'El título es requerido' }

  const post = await prisma.post.findFirst({
    where: { id, tenantId },
    include: { values: true },
  })
  if (!post) return { error: 'Post no encontrado' }

  const postType = await prisma.postType.findUnique({
    where: { id: post.postTypeId },
    select: { fields: { orderBy: { sortOrder: 'asc' } } },
  })

  const fieldValues: Record<string, string> = fieldValuesJson ? JSON.parse(fieldValuesJson) : {}

  for (const field of postType?.fields ?? []) {
    if (field.required && !fieldValues[field.key]?.trim()) {
      return { error: `El campo "${field.name}" es requerido` }
    }
  }

  const wasPublished = post.isPublished

  await prisma.$transaction([
    prisma.postFieldValue.deleteMany({ where: { postId: id } }),
    prisma.post.update({
      where: { id },
      data: {
        title,
        isPublished,
        publishedAt: isPublished && !wasPublished ? new Date() : post.publishedAt,
        values: {
          create: Object.entries(fieldValues)
            .filter(([, v]) => v?.trim())
            .map(([fieldKey, value]) => ({ fieldKey, value: value.trim() })),
        },
      },
    }),
  ])

  revalidatePath('/dashboard/posts')
  redirect('/dashboard/posts')
}

export async function deletePost(id: string) {
  const tenantId = await getTenantId()
  await prisma.post.deleteMany({ where: { id, tenantId } })
  revalidatePath('/dashboard/posts')
}

export async function togglePublish(id: string, publish: boolean) {
  const tenantId = await getTenantId()
  await prisma.post.updateMany({
    where: { id, tenantId },
    data: {
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    },
  })
  revalidatePath('/dashboard/posts')
}
