'use client'

import { useState } from 'react'
import { ProductDrawer } from './ProductDrawer'
import { ProductSlideshow } from './ProductSlideshow'

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  discountPrice: string | null
  imageUrls: string[]
  category: { id: string; name: string; sortOrder: number } | null
}

type FeaturedProduct = {
  id: string
  name: string
  description: string | null
  price: string
  discountPrice: string | null
  imageUrls: string[]
}

type Section = {
  categoryName: string
  sortOrder: number
  products: Product[]
}

interface TenantCatalogProps {
  featuredProducts: FeaturedProduct[]
  sections: Section[]
  tenantWhatsapp?: string | null | undefined
}

export function TenantCatalog({ featuredProducts, sections, tenantWhatsapp }: TenantCatalogProps) {
  const [selected, setSelected] = useState<Product | null>(null)

  return (
    <>
      {/* Slideshow destacados */}
      {featuredProducts.length > 0 && (
        <div className="mb-8">
          <ProductSlideshow products={featuredProducts} />
        </div>
      )}

      {/* Catálogo */}
      {sections.length > 0 ? (
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.categoryName}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                {section.categoryName}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {section.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-gray-100 transition-transform active:scale-95"
                  >
                    <div className="aspect-square bg-gray-50">
                      {p.imageUrls[0] ? (
                        <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">📦</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900">{p.name}</p>
                      <div className="mt-1">
                        {p.discountPrice ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-primary">
                              ${Number(p.discountPrice).toLocaleString('es-AR')}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ${Number(p.price).toLocaleString('es-AR')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-800">
                            ${Number(p.price).toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 py-12 text-center">
          <span className="text-3xl">🛍️</span>
          <p className="text-sm text-gray-500">El catálogo se está preparando</p>
        </div>
      )}

      {/* Drawer de detalle */}
      {selected && (
        <ProductDrawer
          product={selected}
          tenantWhatsapp={tenantWhatsapp ?? null}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
