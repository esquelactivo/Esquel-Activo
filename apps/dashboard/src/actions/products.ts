'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uploadProductImage(file: File, tenantSlug: string, productSlug: string) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `esquel-activo/products/${tenantSlug}`,
    public_id: productSlug,
    overwrite: true,
    transformation: [{ width: 800, crop: 'limit', fetch_format: 'auto', quality: 'auto' }],
  })
  return result.secure_url
}

export async function createProduct(formData: FormData): Promise<{ success: true; productId: string } | { success: false; error: string }> {
  const session = await auth()
  if (!session?.user?.tenantId || !session?.user?.tenantSlug) return { success: false, error: 'No autorizado' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const discountPrice = formData.get('discountPrice') as string
  const categoryId = formData.get('categoryId') as string
  const isFeatured = formData.get('isFeatured') === 'true'
  const imageFile = formData.get('image') as File | null

  if (!name || !price) return { success: false, error: 'Nombre y precio son requeridos' }

  const slug = slugify(name) + '-' + Date.now()

  try {
    let imageUrl: string | null = null
    if (imageFile && imageFile.size > 0) {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return { success: false, error: 'Las variables de Cloudinary no están configuradas en el servidor.' }
      }
      imageUrl = await uploadProductImage(imageFile, session.user.tenantSlug, slug)
    }

    const product = await prisma.product.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        isFeatured,
        categoryId: categoryId || null,
        imageUrls: imageUrl ? [imageUrl] : [],
        isActive: true,
      },
    })

    revalidatePath('/dashboard/products')
    revalidateTag('tenant-products')
    return { success: true, productId: product.id }
  } catch (err) {
    console.error('Error creando producto:', err)
    return { success: false, error: 'Error al crear el producto' }
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId || !session?.user?.tenantSlug) return { success: false, error: 'No autorizado' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const discountPrice = formData.get('discountPrice') as string
  const categoryId = formData.get('categoryId') as string
  const isFeatured = formData.get('isFeatured') === 'true'
  const imageFile = formData.get('image') as File | null

  if (!name || !price) return { success: false, error: 'Nombre y precio son requeridos' }

  try {
    // Verificar que el producto pertenece a este tenant
    const existing = await prisma.product.findFirst({
      where: { id, tenantId: session.user.tenantId },
    })
    if (!existing) return { success: false, error: 'Producto no encontrado' }

    let imageUrls = existing.imageUrls
    if (imageFile && imageFile.size > 0) {
      const newUrl = await uploadProductImage(imageFile, session.user.tenantSlug, existing.slug)
      imageUrls = [newUrl]
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        isFeatured,
        categoryId: categoryId || null,
        imageUrls,
      },
    })

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (err) {
    console.error('Error actualizando producto:', err)
    return { success: false, error: 'Error al actualizar el producto' }
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  try {
    // Verificar que el producto pertenece a este tenant
    const existing = await prisma.product.findFirst({
      where: { id, tenantId: session.user.tenantId },
    })
    if (!existing) return { success: false, error: 'Producto no encontrado' }

    await prisma.product.delete({ where: { id } })
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (err) {
    console.error('Error eliminando producto:', err)
    return { success: false, error: 'Error al eliminar el producto' }
  }
}

export async function toggleFeatured(id: string, isFeatured: boolean): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false }

  const existing = await prisma.product.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!existing) return { success: false }

  await prisma.product.update({ where: { id }, data: { isFeatured } })
  revalidatePath('/dashboard/products')
  return { success: true }
}

export async function toggleActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false }

  const existing = await prisma.product.findFirst({ where: { id, tenantId: session.user.tenantId } })
  if (!existing) return { success: false }

  await prisma.product.update({ where: { id }, data: { isActive } })
  revalidatePath('/dashboard/products')
  return { success: true }
}
