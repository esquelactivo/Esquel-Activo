'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'

export async function getProductVariants(productId: string) {
  const session = await auth()
  if (!session?.user?.tenantId) return []

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId: session.user.tenantId },
    select: { id: true },
  })
  if (!product) return []

  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: { price: 'asc' },
    select: { id: true, name: true, price: true, stock: true, isActive: true },
  })

  return variants.map(v => ({ ...v, price: v.price.toString() }))
}

export async function createVariant(
  productId: string,
  data: { name: string; price: number; stock: number }
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId: session.user.tenantId },
    select: { id: true },
  })
  if (!product) return { success: false, error: 'Producto no encontrado' }

  try {
    await prisma.productVariant.create({
      data: { productId, name: data.name, price: data.price, stock: data.stock },
    })
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al crear la variante' }
  }
}

export async function updateVariant(
  variantId: string,
  data: { name?: string; price?: number; stock?: number; isActive?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { tenantId: session.user.tenantId } },
    select: { id: true },
  })
  if (!variant) return { success: false, error: 'Variante no encontrada' }

  try {
    await prisma.productVariant.update({ where: { id: variantId }, data })
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al actualizar la variante' }
  }
}

export async function deleteVariant(variantId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { tenantId: session.user.tenantId } },
    select: { id: true },
  })
  if (!variant) return { success: false, error: 'Variante no encontrada' }

  try {
    await prisma.productVariant.delete({ where: { id: variantId } })
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar la variante' }
  }
}
