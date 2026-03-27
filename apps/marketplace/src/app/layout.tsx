import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { getTenantCssVars } from '@esquel-activo/tenant-engine'
import { getCurrentTenant } from '@/lib/tenant'
import '@esquel-activo/ui/globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { template: '%s | Tienda', default: 'Esquel Activo — Tienda' },
}

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant()
  const cssVars = tenant ? getTenantCssVars(tenant) : {}

  return (
    <html lang="es" className={geistSans.variable} style={cssVars as React.CSSProperties}>
      <head>
        <link rel="manifest" href="/api/manifest" />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
