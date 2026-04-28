'use server'

import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'

export async function createNotification(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const imageUrl = formData.get('imageUrl') as string
  const targetType = formData.get('targetType') as string
  const tenantId = formData.get('tenantId') as string
  const userId = formData.get('userId') as string

  if (!title?.trim() || !body?.trim()) {
    return { success: false, error: 'El título y el mensaje son requeridos' }
  }

  const validTargets = ['ALL', 'CLIENTS', 'BUSINESSES', 'TENANT', 'USER']
  if (!validTargets.includes(targetType)) {
    return { success: false, error: 'Destinatario inválido' }
  }

  try {
    await prisma.notification.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl?.trim() || null,
        targetType: targetType as any,
        tenantId: targetType === 'TENANT' ? tenantId || null : null,
        userId: targetType === 'USER' ? userId || null : null,
      },
    })

    revalidatePath('/admin/notifications')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al enviar la notificación' }
  }
}

export async function deleteNotification(formData: FormData): Promise<void> {
  const id = formData.get('id') as string
  await prisma.notification.delete({ where: { id } })
  revalidatePath('/admin/notifications')
}
