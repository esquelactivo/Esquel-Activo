'use server'

import { prisma } from '@esquel-activo/db'
import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function toggleUserActive(formData: FormData) {
  const userId = formData.get('userId') as string
  const hasPassword = formData.get('hasPassword') === 'true'

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hasPassword ? null : undefined },
  })

  revalidatePath('/admin/users')
}

export async function createUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string
  const tenantId = formData.get('tenantId') as string
  const role = formData.get('role') as string

  if (!email || !password || !name) return { success: false, error: 'Email, nombre y contraseña son requeridos' }
  if (password.length < 6) return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { success: false, error: 'Ya existe un usuario con ese email' }

    const passwordHash = await hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        memberships: tenantId ? {
          create: { tenantId, role: role as any || 'OWNER' },
        } : undefined,
      },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al crear el usuario' }
  }
}

export async function updateUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        ...(password && password.length >= 6 ? { passwordHash: await hash(password, 10) } : {}),
      },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al actualizar el usuario' }
  }
}

export async function deleteUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const userId = formData.get('userId') as string

  try {
    await prisma.user.delete({ where: { id: userId } })
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar el usuario' }
  }
}
