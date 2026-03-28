'use client'

import { useState, useEffect, useCallback } from 'react'

type FeaturedProduct = {
  id: string
  name: string
  description: string | null
  price: string
  discountPrice: string | null
  imageUrls: string[]
}

export function ProductSlideshow({ products }: { products: FeaturedProduct[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % products.length), [products.length])
  const prev = () => setCurrent((c) => (c - 1 + products.length) % products.length)

  useEffect(() => {
    if (paused || products.length <= 1) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [paused, next, products.length])

  if (products.length === 0) return null

  const slide = products[current]

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: '16/7' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {products.map((p, i) => (
        <div
          key={p.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {p.imageUrls[0] ? (
            <img
              src={p.imageUrls[0]}
              alt={p.name}
              className="h-full w-full object-cover object-center"
              style={{ position: 'absolute', inset: 0 }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary" />
          )}

          {/* Overlay degradado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Contenido del slide actual */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Destacado</p>
        <h3 className="mt-1 text-lg font-bold text-white md:text-2xl">{slide.name}</h3>
        {slide.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-white/80">{slide.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {slide.discountPrice ? (
            <>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary">
                ${Number(slide.discountPrice).toLocaleString('es-AR')}
              </span>
              <span className="text-sm text-white/60 line-through">
                ${Number(slide.price).toLocaleString('es-AR')}
              </span>
            </>
          ) : (
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              ${Number(slide.price).toLocaleString('es-AR')}
            </span>
          )}
        </div>
      </div>

      {/* Navegación — solo si hay más de 1 */}
      {products.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50"
          >
            <ChevronRight />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
