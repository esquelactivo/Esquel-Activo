'use client'

import { useEffect } from 'react'

type Product = {
  id: string
  name: string
  description: string | null
  price: string | number
  discountPrice: string | number | null
  imageUrls: string[]
  category: { name: string } | null
}

interface ProductDrawerProps {
  product: Product
  tenantWhatsapp?: string | null
  onClose: () => void
}

export function ProductDrawer({ product, tenantWhatsapp, onClose }: ProductDrawerProps) {
  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const price = Number(product.price)
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null
  const hasImage = product.imageUrls.length > 0

  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa el producto: *${product.name}*${discountPrice ? ` ($${discountPrice.toLocaleString('es-AR')})` : ` ($${price.toLocaleString('es-AR')})`}`
  )
  const whatsappUrl = tenantWhatsapp
    ? `https://wa.me/${tenantWhatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl">
        {/* Imagen */}
        {hasImage && (
          <div className="aspect-video w-full bg-gray-100">
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-8 pt-4">
          {/* Categoría */}
          {product.category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              {product.category.name}
            </p>
          )}

          {/* Nombre */}
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>

          {/* Precio */}
          <div className="mt-2 flex items-center gap-2">
            {discountPrice ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  ${discountPrice.toLocaleString('es-AR')}
                </span>
                <span className="text-base text-gray-400 line-through">
                  ${price.toLocaleString('es-AR')}
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  -{Math.round((1 - discountPrice / price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ${price.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-2">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 text-sm font-bold text-white shadow-sm hover:bg-green-600"
              >
                <WhatsAppIcon />
                Consultar por WhatsApp
              </a>
            ) : (
              <button
                disabled
                className="rounded-2xl bg-primary py-4 text-sm font-bold text-white opacity-80"
              >
                Consultar disponibilidad
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
