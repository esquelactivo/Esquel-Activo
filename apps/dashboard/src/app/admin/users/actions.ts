'use server'

import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'

export async function toggleUserActive(formData: FormData) {
  const userId = formData.get('userId') as string
  const hasPassword = formData.get('hasPassword') === 'true'

  // Suspender = borrar el passwordHash (no puede loguearse)
  // Reactivar = requiere reset de contraseña manual por ahora
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hasPassword ? null : undefined },
  })

  revalidatePath('/admin/users')
}
