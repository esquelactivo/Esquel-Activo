import { NextResponse } from 'next/server'
import { prisma } from '@esquel-activo/db'
import { getCurrentTenant } from '@/lib/tenant'

type OrderItemInput = {
  productId: string
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

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        customerName: customerName ?? null,
        customerPhone: customerPhone ?? null,
        subtotal,
        total: subtotal,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
      },
      select: { id: true, number: true },
    })

    return NextResponse.json({ orderId: order.id, orderNumber: order.number })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Error al registrar el pedido' }, { status: 500 })
  }
}
