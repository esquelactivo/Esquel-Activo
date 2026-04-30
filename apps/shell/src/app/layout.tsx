import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { getTenantCssVars } from '@esquel-activo/tenant-engine'
import { prisma } from '@esquel-activo/db'
import { getCurrentTenant } from '@/lib/tenant'
import { auth } from '@/lib/auth'
import { Header } from '@/components/Header'
import { CartProvider } from '@/context/CartContext'
import { NavProvider } from '@/context/NavContext'
import { CartShell } from '@/components/CartShell'
import { BottomTabs } from '@/components/BottomTabs'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import { PushNotificationBanner } from '@/components/PushNotificationBanner'
import NextTopLoader from 'nextjs-toploader'
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

async function getNavTenants() {
  return prisma.tenant.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, brandName: true, logoUrl: true, primaryColor: true },
    orderBy: { name: 'asc' },
  })
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [tenant, navTenants, session] = await Promise.all([
    getCurrentTenant(),
    getNavTenants(),
    auth(),
  ])

  const cssVars = tenant ? getTenantCssVars(tenant) : {}
  const isLoggedIn = !!session?.user

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
      <body className={`min-h-screen ${isLoggedIn ? 'pb-16' : ''}`}>
        <NextTopLoader color="var(--color-primary, #1a1a2e)" showSpinner={false} />
        <ServiceWorkerRegistrar />
        <CartProvider>
          <NavProvider tenants={navTenants} currentTenantSlug={tenant?.slug ?? null}>
            <Header tenants={navTenants} currentTenantSlug={tenant?.slug ?? null} isLoggedIn={isLoggedIn} />
            {children}
            <CartShell tenantWhatsapp={tenant?.contactPhone ?? null} />
            {isLoggedIn && session.user && (
              <BottomTabs session={{ user: { name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null } }} />
            )}
            <PushNotificationBanner />
          </NavProvider>
        </CartProvider>
      </body>
    </html>
  )
}
