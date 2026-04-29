'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'

export async function updateTenantInfo(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  const brandName = (formData.get('brandName') as string)?.trim()
  const contactPhone = (formData.get('contactPhone') as string)?.trim()
  const contactEmail = (formData.get('contactEmail') as string)?.trim()
  const address = (formData.get('address') as string)?.trim()
  const instagramUrl = (formData.get('instagramUrl') as string)?.trim()
  const facebookUrl = (formData.get('facebookUrl') as string)?.trim()
  const googleBusinessUrl = (formData.get('googleBusinessUrl') as string)?.trim()

  try {
    await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        brandName: brandName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        address: address || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        googleBusinessUrl: googleBusinessUrl || null,
      },
    })

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al guardar los cambios' }
  }
}
