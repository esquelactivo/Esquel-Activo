// Mismo manifest dinámico que en shell
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getCurrentTenant } from '@/lib/tenant'

export async function GET() {
  const tenant = await getCurrentTenant()
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3001'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const origin = `${protocol}://${host}`

  const manifest = {
    name: tenant?.brandName ?? 'Esquel Activo',
    short_name: tenant?.brandName ?? 'Esquel',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: tenant?.primaryColor ?? '#1a1a2e',
    icons: tenant?.logoUrl
      ? [{ src: tenant.logoUrl, sizes: '512x512', type: 'image/png' }]
      : [{ src: `${origin}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' }],
    lang: 'es-AR',
  }

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' },
  })
}
