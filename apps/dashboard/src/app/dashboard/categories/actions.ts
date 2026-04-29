'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createCategory(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { success: false, error: 'El nombre es requerido' }

  const slug = slugify(name) + '-' + Date.now().toString(36)

  try {
    await prisma.category.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        slug,
        description: (formData.get('description') as string)?.trim() || null,
        sortOrder: Number(formData.get('sortOrder') ?? 0) || 0,
      },
    })
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al crear la categoría' }
  }
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { success: false, error: 'El nombre es requerido' }

  const cat = await prisma.category.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!cat) return { success: false, error: 'Categoría no encontrada' }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        description: (formData.get('description') as string)?.trim() || null,
        sortOrder: Number(formData.get('sortOrder') ?? 0) || 0,
      },
    })
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al actualizar la categoría' }
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  const cat = await prisma.category.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!cat) return { success: false, error: 'Categoría no encontrada' }

  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'No se puede eliminar: tiene productos asociados' }
  }
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user?.tenantId) return

  await prisma.category.updateMany({
    where: { id, tenantId: session.user.tenantId },
    data: { isActive },
  })
  revalidatePath('/dashboard/categories')
}
