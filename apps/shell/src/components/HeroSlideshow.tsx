'use client'

import { useState, useEffect, useCallback } from 'react'

type Slide = {
  id: string
  imageUrl: string | null
  title: string | null
  subtitle: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  bgColor: string
}

type HeroSlideshowProps = {
  slides: Slide[]
  autoPlayMs?: number
}

/**
 * Slideshow principal del home — promos y destacados.
 * Auto-play configurable, navegación por dots y flechas.
 * Los slides se cargarán desde la DB cuando esté el Dashboard.
 */
export function HeroSlideshow({ slides, autoPlayMs = 4000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  // Auto-play
  useEffect(() => {
    if (paused || slides.length <= 1) return
    const interval = setInterval(next, autoPlayMs)
    return () => clearInterval(interval)
  }, [paused, next, autoPlayMs, slides.length])

  if (slides.length === 0) return null

  const slide = slides[current]
  if (!slide) return null

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: '16/7' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === current ? 1 : 0,
            backgroundColor: s.bgColor,
          }}
        >
          {/* Imagen de fondo */}
          {s.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.imageUrl}
              alt={s.title ?? ''}
              className="h-full w-full object-cover"
            />
          )}

          {/* Overlay con texto */}
          {(s.title ?? s.subtitle ?? s.ctaLabel) && (
            <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 md:p-8">
              {s.title && (
                <h2 className="text-xl font-bold text-white drop-shadow md:text-3xl">
                  {s.title}
                </h2>
              )}
              {s.subtitle && (
                <p className="mt-1 text-sm text-white/80 drop-shadow md:text-base">
                  {s.subtitle}
                </p>
              )}
              {s.ctaLabel && s.ctaUrl && (
                <a
                  href={s.ctaUrl}
                  className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
                >
                  {s.ctaLabel}
                </a>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Flecha izquierda */}
      {slides.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Slide anterior"
        >
          <ChevronLeft />
        </button>
      )}

      {/* Flecha derecha */}
      {slides.length > 1 && (
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Siguiente slide"
        >
          <ChevronRight />
        </button>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
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
