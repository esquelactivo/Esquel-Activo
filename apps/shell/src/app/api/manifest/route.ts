/**
 * API Route: /api/manifest
 *
 * Genera el manifest.json de la PWA DINÁMICAMENTE según el tenant.
 * Si el usuario entra al dominio de "Chocolatería Esquel", el ícono
 * y el nombre de la app instalable será el de ese comercio — no el de
 * la plataforma madre. Esto implementa el Blueprint §3.
 *
 * Documentación PWA Manifest: https://web.dev/add-manifest/
 */
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getCurrentTenant } from '@/lib/tenant'

export async function GET() {
  const tenant = await getCurrentTenant()
  const headersList = await headers()

  // Reconstruimos el origin del request para los URLs del manifest
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const origin = `${protocol}://${host}`

  const manifest = tenant
    ? {
        name: tenant.brandName,
        short_name: tenant.brandName,
        description: `Tienda online de ${tenant.name}`,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: tenant.primaryColor,
        icons: tenant.logoUrl
          ? [
              { src: tenant.logoUrl, sizes: '192x192', type: 'image/png' },
              { src: tenant.logoUrl, sizes: '512x512', type: 'image/png' },
            ]
          : defaultIcons(origin),
        categories: ['shopping'],
        lang: 'es-AR',
      }
    : {
        // Manifest de la plataforma global
        name: 'Esquel Activo',
        short_name: 'Esquel',
        description: 'Ecosistema digital de comercios de Esquel',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a1a2e',
        icons: [], // Se agregarán cuando haya íconos PWA reales
        categories: ['shopping'],
        lang: 'es-AR',
      }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      // Cache de 1 hora — permite actualizaciones sin ser demasiado agresivo
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function defaultIcons(origin: string) {
  return [
    { src: `${origin}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${origin}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
  ]
}
