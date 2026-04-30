'use server'

import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type FieldInput = {
  id?: string
  name: string
  key: string
  type: string
  required: boolean
  placeholder: string
  sortOrder: number
}

export async function createPostType(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const icon = (formData.get('icon') as string | null)?.trim() || null
  const fieldsJson = formData.get('fields') as string

  if (!name || !slug) return { error: 'Nombre y slug son requeridos' }
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: 'El slug solo puede tener letras minúsculas, números y guiones' }

  const fields: FieldInput[] = fieldsJson ? JSON.parse(fieldsJson) : []

  try {
    await prisma.postType.create({
      data: {
        name,
        slug,
        description,
        icon,
        fields: {
          create: fields.map((f, i) => ({
            name: f.name,
            key: f.key,
            type: f.type as any,
            required: f.required,
            placeholder: f.placeholder || null,
            sortOrder: i,
          })),
        },
      },
    })
  } catch (e: any) {
    if (e?.code === 'P2002') return { error: 'Ya existe un tipo con ese slug' }
    return { error: 'Error al crear el tipo de contenido' }
  }

  revalidatePath('/admin/post-types')
  redirect('/admin/post-types')
}

export async function updatePostType(id: string, formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const icon = (formData.get('icon') as string | null)?.trim() || null
  const isActive = formData.get('isActive') === 'true'
  const fieldsJson = formData.get('fields') as string

  if (!name || !slug) return { error: 'Nombre y slug son requeridos' }
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: 'El slug solo puede tener letras minúsculas, números y guiones' }

  const fields: FieldInput[] = fieldsJson ? JSON.parse(fieldsJson) : []

  try {
    await prisma.$transaction([
      prisma.postTypeField.deleteMany({ where: { postTypeId: id } }),
      prisma.postType.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          icon,
          isActive,
          fields: {
            create: fields.map((f, i) => ({
              name: f.name,
              key: f.key,
              type: f.type as any,
              required: f.required,
              placeholder: f.placeholder || null,
              sortOrder: i,
            })),
          },
        },
      }),
    ])
  } catch (e: any) {
    if (e?.code === 'P2002') return { error: 'Ya existe un tipo con ese slug' }
    return { error: 'Error al actualizar el tipo de contenido' }
  }

  revalidatePath('/admin/post-types')
  redirect('/admin/post-types')
}

export async function deletePostType(id: string) {
  await prisma.postType.delete({ where: { id } })
  revalidatePath('/admin/post-types')
}
