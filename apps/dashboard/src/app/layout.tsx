import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { getTenantCssVars } from '@esquel-activo/tenant-engine'
import { getCurrentTenant } from '@/lib/tenant'
import '@esquel-activo/ui/globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { template: '%s | Panel', default: 'Panel de Gestión — Esquel Activo' },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant()
  const cssVars = tenant ? getTenantCssVars(tenant) : {}

  return (
    <html lang="es" className={geistSans.variable} style={cssVars as React.CSSProperties}>
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  )
}
