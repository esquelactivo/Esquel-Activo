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

export async function createStampCard(formData: FormData) {
  const tenantId = await getTenantId()

  const existing = await prisma.stampCard.findFirst({ where: { tenantId } })
  if (existing) return { error: 'Ya tenés una tarjeta de sellos creada' }

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const totalStamps = parseInt(formData.get('totalStamps') as string, 10)
  const reward = (formData.get('reward') as string).trim()
  const color = (formData.get('color') as string | null)?.trim() || null

  if (!name || !reward || isNaN(totalStamps) || totalStamps < 2 || totalStamps > 50) {
    return { error: 'Completá todos los campos. Los sellos deben ser entre 2 y 50.' }
  }

  await prisma.stampCard.create({
    data: { tenantId, name, description, totalStamps, reward, color },
  })

  revalidatePath('/dashboard/stamps')
  redirect('/dashboard/stamps')
}

export async function updateStampCard(id: string, formData: FormData) {
  const tenantId = await getTenantId()

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const totalStamps = parseInt(formData.get('totalStamps') as string, 10)
  const reward = (formData.get('reward') as string).trim()
  const color = (formData.get('color') as string | null)?.trim() || null
  const isActive = formData.get('isActive') === 'true'

  if (!name || !reward || isNaN(totalStamps) || totalStamps < 2 || totalStamps > 50) {
    return { error: 'Completá todos los campos. Los sellos deben ser entre 2 y 50.' }
  }

  await prisma.stampCard.updateMany({
    where: { id, tenantId },
    data: { name, description, totalStamps, reward, color, isActive },
  })

  revalidatePath('/dashboard/stamps')
  redirect('/dashboard/stamps')
}

export async function redeemQrCode(code: string): Promise<{ success: boolean; error?: string; userName?: string; currentStamps?: number; totalStamps?: number }> {
  const tenantId = await getTenantId()

  // Validar el token
  const token = await prisma.qrToken.findUnique({ where: { code } })

  if (!token) return { success: false, error: 'Código inválido' }
  if (token.usedAt) return { success: false, error: 'Este código ya fue usado' }
  if (token.expiresAt < new Date()) return { success: false, error: 'El código expiró. Pedile al cliente que genere uno nuevo.' }
  if (token.tenantId !== tenantId) return { success: false, error: 'Este código no corresponde a tu comercio' }
  if (token.type !== 'STAMP') return { success: false, error: 'Tipo de código incorrecto' }

  // Obtener la tarjeta de sellos activa del comercio
  const stampCard = await prisma.stampCard.findFirst({
    where: { tenantId, isActive: true },
  })
  if (!stampCard) return { success: false, error: 'No tenés una tarjeta de sellos activa' }

  // Obtener o crear la tarjeta del usuario
  let userCard = await prisma.userStampCard.findUnique({
    where: { stampCardId_userId: { stampCardId: stampCard.id, userId: token.userId } },
  })
  if (!userCard) {
    userCard = await prisma.userStampCard.create({
      data: { stampCardId: stampCard.id, userId: token.userId, currentStamps: 0, completedCount: 0 },
    })
  }

  // Calcular nuevos sellos
  const newStamps = userCard.currentStamps + 1
  const completed = newStamps >= stampCard.totalStamps

  await prisma.$transaction([
    prisma.qrToken.update({ where: { code }, data: { usedAt: new Date() } }),
    prisma.userStampCard.update({
      where: { id: userCard.id },
      data: {
        currentStamps: completed ? 0 : newStamps,
        completedCount: { increment: completed ? 1 : 0 },
      },
    }),
    prisma.stampTransaction.create({
      data: { userCardId: userCard.id, stampsAdded: 1 },
    }),
  ])

  // Obtener nombre del usuario para el feedback
  const user = await prisma.user.findUnique({
    where: { id: token.userId },
    select: { name: true, email: true },
  })

  return {
    success: true,
    userName: user?.name ?? user?.email ?? 'Cliente',
    currentStamps: completed ? stampCard.totalStamps : newStamps,
    totalStamps: stampCard.totalStamps,
  }
}
