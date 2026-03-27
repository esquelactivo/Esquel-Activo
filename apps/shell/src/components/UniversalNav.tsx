'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type NavTenant = {
  slug: string
  name: string
  brandName: string | null
  logoUrl: string | null
  primaryColor: string
}

type UniversalNavProps = {
  tenants: NavTenant[]
  currentTenantSlug: string | null
}

/**
 * Menú universal — siempre visible en la esquina superior.
 * Permite volver al home y navegar entre comercios desde cualquier página.
 */
export function UniversalNav({ tenants, currentTenantSlug }: UniversalNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Cerrar con Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <div ref={menuRef} className="fixed top-4 right-4 z-50">
      {/* Botón grid */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-all hover:shadow-lg active:scale-95"
        aria-label="Menú de navegación"
        aria-expanded={isOpen}
      >
        <GridIcon />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-64 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          {/* Link al home */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f2c32]">
              <span className="text-sm font-bold text-white">EA</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Esquel Activo</p>
              <p className="text-xs text-gray-400">Ir al inicio</p>
            </div>
          </Link>

          {/* Separador */}
          {tenants.length > 0 && (
            <>
              <div className="border-t border-gray-100 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Comercios
                </p>
              </div>

              {/* Lista de tenants */}
              <div className="max-h-60 overflow-y-auto">
                {tenants.map((t) => {
                  const isActive = t.slug === currentTenantSlug
                  return (
                    <Link
                      key={t.slug}
                      href={`/?tenant=${t.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 ${
                        isActive ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                        style={{ backgroundColor: t.primaryColor }}
                      >
                        {t.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.logoUrl}
                            alt={t.brandName ?? t.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {t.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-sm text-gray-700">
                        {t.brandName ?? t.name}
                      </span>
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function GridIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-600"
    >
      <rect x="1" y="1" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="6.75" y="1" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="12.5" y="1" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="1" y="6.75" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="6.75" y="6.75" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="12.5" y="6.75" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="1" y="12.5" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="6.75" y="12.5" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      <rect x="12.5" y="12.5" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
    </svg>
  )
}
