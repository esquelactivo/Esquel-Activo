'use server'

import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'
import webPush from 'web-push'

function getWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL ?? 'mailto:admin@esquel-activo.com'
  if (!publicKey || !privateKey) return null
  webPush.setVapidDetails(email, publicKey, privateKey)
  return webPush
}

async function sendPushToSubscriptions(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url?: string }
) {
  const wp = getWebPush()
  if (!wp || subscriptions.length === 0) return

  const payloadStr = JSON.stringify(payload)
  await Promise.allSettled(
    subscriptions.map(sub =>
      wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payloadStr
      ).catch(() => {
        // Remove dead subscriptions silently
        prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } }).catch(() => {})
      })
    )
  )
}

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

    // Send web push to relevant subscribers (fire-and-forget)
    const pushFilter: Record<string, unknown> = {}
    if (targetType === 'TENANT' && tenantId) pushFilter.tenantId = tenantId
    else if (targetType === 'USER' && userId) pushFilter.userId = userId
    // ALL and CLIENTS: send to all subscribers

    const subs = await prisma.pushSubscription.findMany({ where: pushFilter, take: 500 })
    sendPushToSubscriptions(subs, { title: title.trim(), body: body.trim(), url: '/' })

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
