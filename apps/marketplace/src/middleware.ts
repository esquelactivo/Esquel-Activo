// El marketplace usa el mismo middleware de resolución de tenant que el shell.
// Reutilizamos la lógica del package tenant-engine.
import { NextResponse, type NextRequest } from 'next/server'
import { extractTenantSlug } from '@esquel-activo/tenant-engine'

export function middleware(request: NextRequest) {
  const { hostname } = new URL(request.url)
  const resolution = extractTenantSlug(hostname, request.nextUrl.searchParams, request.headers)

  const response = NextResponse.next()
  response.headers.set('x-resolved-tenant-slug', resolution?.slug ?? '')
  if (resolution) {
    response.headers.set('x-tenant-resolution-source', resolution.source)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
