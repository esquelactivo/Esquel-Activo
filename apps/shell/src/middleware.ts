import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse, type NextRequest } from 'next/server'
import { extractTenantSlug } from '@esquel-activo/tenant-engine'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { hostname } = new URL(req.url)
  const resolution = extractTenantSlug(
    hostname,
    (req as NextRequest).nextUrl.searchParams,
    req.headers
  )

  const response = NextResponse.next()

  if (resolution) {
    response.headers.set('x-resolved-tenant-slug', resolution.slug)
    response.headers.set('x-tenant-resolution-source', resolution.source)
  } else {
    response.headers.set('x-resolved-tenant-slug', '')
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
