'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.tenantId) return { success: false, error: 'No autorizado' }

  try {
    // Verificar que la orden pertenece al tenant
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId: session.user.tenantId },
      select: { id: true },
    })
    if (!order) return { success: false, error: 'Pedido no encontrado' }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath('/dashboard/orders')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al actualizar el estado' }
  }
}
