'use server'

import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadLogo(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantSlug) {
    return { success: false, error: 'No autorizado' }
  }

  const file = formData.get('image') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No se seleccionó ningún archivo' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'El archivo no puede superar los 5 MB' }
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Solo se permiten imágenes' }
  }

  try {
    // Convert File to base64 data URI
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `esquel-activo/logos/${session.user.tenantSlug}`,
      public_id: 'logo',
      overwrite: true,
      // Auto-optimize: convert to WebP, max width 400px
      transformation: [{ width: 400, crop: 'limit', fetch_format: 'auto', quality: 'auto' }],
    })

    await prisma.tenant.update({
      where: { slug: session.user.tenantSlug },
      data: { logoUrl: result.secure_url },
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('Error subiendo logo:', err)
    return { success: false, error: 'Error al subir la imagen. Intentá de nuevo.' }
  }
}
