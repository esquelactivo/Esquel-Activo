'use client'

/**
 * Enlace al panel de gestión.
 * Construye la URL dinámicamente usando el hostname actual,
 * para que funcione tanto en localhost como en la IP local de la red
 * (ej: acceso desde el celular).
 */
export function LoginLink() {
  function getLoginUrl() {
    if (typeof window === 'undefined') return '#'
    const { hostname } = window.location
    return `http://${hostname}:3002/login`
  }

  return (
    <a
      href={getLoginUrl()}
      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
    >
      Acceder
    </a>
  )
}
