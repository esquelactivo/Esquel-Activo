import { NextResponse } from 'next/server'
import { prisma } from '@esquel-activo/db'
import { getCurrentTenant } from '@/lib/tenant'

type OrderItemInput = {
  productId: string
  variantId?: string | null
  name: string
  price: number
  quantity: number
}

export async function POST(request: Request) {
  try {
    const tenant = await getCurrentTenant()
    if (!tenant) return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })

    const body = await request.json() as {
      items: OrderItemInput[]
      customerName?: string
      customerPhone?: string
    }

    const { items, customerName, customerPhone } = body
    if (!items?.length) return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const itemsWithVariant = items.filter(i => i.variantId)

    // Verificar stock antes de la transacción (error amigable al usuario)
    for (const item of itemsWithVariant) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId! },
        select: { stock: true },
      })
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Sin stock suficiente para "${item.name}"` },
          { status: 400 }
        )
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      // Decrementar stock atómicamente
      for (const item of itemsWithVariant) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.variantId!, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
        if (result.count === 0) {
          throw new Error(`Sin stock para "${item.name}"`)
        }
      }

      return tx.order.create({
        data: {
          tenantId: tenant.id,
          customerName: customerName ?? null,
          customerPhone: customerPhone ?? null,
          subtotal,
          total: subtotal,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId ?? null,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
          },
        },
        select: { id: true, number: true },
      })
    })

    return NextResponse.json({ orderId: order.id, orderNumber: order.number })
  } catch (err: any) {
    console.error('[POST /api/orders]', err)
    const userMessage = err?.message?.startsWith('Sin stock') ? err.message : 'Error al registrar el pedido'
    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
