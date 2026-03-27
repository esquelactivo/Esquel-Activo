/**
 * Edge Middleware — Resolución del Tenant (Blueprint §3)
 *
 * Este archivo corre en el Edge Runtime de Vercel/Next.js ANTES de que
 * cualquier página o API sea ejecutada. Es el "portero" del sistema.
 *
 * Flujo:
 *   Request → Middleware → Identifica tenant → Inyecta header → Página/API
 *
 * El header "x-resolved-tenant-slug" es leído por los layouts para
 * obtener la configuración visual del tenant desde la DB.
 *
 * IMPORTANTE: El Edge Runtime NO tiene acceso a Node.js APIs ni a Prisma.
 * La resolución pesada (DB lookup) ocurre en el layout del servidor.
 * El middleware solo extrae el slug de la URL para pasarlo adelante.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { extractTenantSlug } from '@esquel-activo/tenant-engine'

export function middleware(request: NextRequest) {
  const { hostname } = new URL(request.url)
  const resolution = extractTenantSlug(
    hostname,
    request.nextUrl.searchParams,
    request.headers
  )

  const response = NextResponse.next()

  if (resolution) {
    // Inyectamos el slug en un header para que el layout del servidor lo lea
    // sin necesidad de parsear la URL nuevamente.
    response.headers.set('x-resolved-tenant-slug', resolution.slug)
    response.headers.set('x-tenant-resolution-source', resolution.source)
  } else {
    // La request es al dominio principal de la plataforma
    response.headers.set('x-resolved-tenant-slug', '')
  }

  return response
}

export const config = {
  // El middleware corre en TODAS las rutas excepto las estáticas y de Next.js
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
