/**
 * Root Layout — Shell Orchestrator
 *
 * Este layout es el "padre" de todas las páginas del shell.
 * Su responsabilidad principal:
 *   1. Resolver el tenant actual
 *   2. Inyectar las CSS Variables del tema (white-label)
 *   3. Generar el <head> dinámico (PWA manifest, favicon, título)
 *   4. Renderizar el menú universal (siempre visible)
 */
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { getTenantCssVars } from '@esquel-activo/tenant-engine'
import { prisma } from '@esquel-activo/db'
import { getCurrentTenant } from '@/lib/tenant'
import { Header } from '@/components/Header'
import { CartProvider } from '@/context/CartContext'
import { NavProvider } from '@/context/NavContext'
import { CartShell } from '@/components/CartShell'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { template: '%s | Esquel Activo', default: 'Esquel Activo' },
  description: 'Ecosistema digital de comercios de Esquel',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

/**
 * Trae todos los tenants activos para el menú universal.
 * Usa cache de React para que una sola request no haga queries duplicados.
 */
async function getNavTenants() {
  return prisma.tenant.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      brandName: true,
      logoUrl: true,
      primaryColor: true,
    },
    orderBy: { name: 'asc' },
  })
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [tenant, navTenants] = await Promise.all([
    getCurrentTenant(),
    getNavTenants(),
  ])

  const cssVars = tenant ? getTenantCssVars(tenant) : {}

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={cssVars as React.CSSProperties}
    >
      <head>
        <link rel="manifest" href="/api/manifest" />
        {tenant?.faviconUrl && <link rel="icon" href={tenant.faviconUrl} />}
      </head>
      <body className="min-h-screen">
        <CartProvider>
          <NavProvider tenants={navTenants} currentTenantSlug={tenant?.slug ?? null}>
            <Header tenants={navTenants} currentTenantSlug={tenant?.slug ?? null} />
            {children}
            <CartShell tenantWhatsapp={tenant?.contactPhone ?? null} />
          </NavProvider>
        </CartProvider>
      </body>
    </html>
  )
}
