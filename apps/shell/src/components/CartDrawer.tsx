'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'

export function CartDrawer({ tenantWhatsapp }: { tenantWhatsapp?: string | null }) {
  const { items, removeItem, updateQuantity, clearCart, total, count, isOpen, closeCart } = useCart()
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  function buildWhatsappUrl(orderNumber?: number) {
    const header = orderNumber ? `Pedido #${orderNumber}\n` : ''
    const lines = items.map(
      i => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toLocaleString('es-AR')}`
    ).join('\n')
    const message = `${header}Hola! Quiero hacer el siguiente pedido:\n${lines}\n\n*Total: $${total.toLocaleString('es-AR')}*`
    const phone = tenantWhatsapp!.replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  async function handleSendOrder() {
    if (!tenantWhatsapp || sending) return
    setSending(true)

    // Abrimos la ventana sincrónicamente para evitar bloqueos del browser
    const win = window.open('', '_blank')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        }),
      })
      const data = res.ok ? await res.json() : null
      const url = buildWhatsappUrl(data?.orderNumber)
      if (win) win.location.href = url
      else window.open(url, '_blank')
      clearCart()
      closeCart()
    } catch {
      // Fallback: igual abrimos WhatsApp aunque no se haya registrado en DB
      const url = buildWhatsappUrl()
      if (win) win.location.href = url
      else window.open(url, '_blank')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />

      <div className="relative w-full max-w-lg flex flex-col rounded-t-3xl bg-white shadow-2xl max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tu carrito</h2>
            {count > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">{count} {count === 1 ? 'producto' : 'productos'}</p>
            )}
          </div>
          <button
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="text-4xl">🛒</span>
              <p className="text-sm text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-14 w-14 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ${item.price.toLocaleString('es-AR')} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-base"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-base"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-1 text-red-400 hover:text-red-600 transition-colors text-xs"
                      aria-label="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">${total.toLocaleString('es-AR')}</span>
            </div>

            {tenantWhatsapp ? (
              <button
                onClick={handleSendOrder}
                disabled={sending}
                className="flex items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 text-sm font-bold text-white hover:bg-green-600 transition-colors disabled:opacity-70"
              >
                {sending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <WhatsAppIcon />
                )}
                {sending ? 'Registrando pedido...' : 'Enviar pedido por WhatsApp'}
              </button>
            ) : (
              <button
                disabled
                className="rounded-2xl bg-gray-200 py-4 text-sm font-medium text-gray-500"
              >
                Configurar WhatsApp para pedir
              </button>
            )}

            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-600 transition-colors text-center"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
