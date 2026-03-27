/**
 * Root Layout — Shell Orchestrator
 *
 * Este layout es el "padre" de todas las páginas del shell.
 * Su responsabilidad principal:
 *   1. Resolver el tenant actual
 *   2. Inyectar las CSS Variables del tema (white-label)
 *   3. Generar el <head> dinámico (PWA manifest, favicon, título)
 */
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { getTenantCssVars } from '@esquel-activo/tenant-engine'
import { getCurrentTenant } from '@/lib/tenant'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

// Metadata base — será sobreescrita por el tenant
export const metadata: Metadata = {
  title: { template: '%s | Esquel Activo', default: 'Esquel Activo' },
  description: 'Ecosistema digital de comercios de Esquel',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Permite que la PWA ocupe toda la pantalla en móvil
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant()
  const cssVars = tenant ? getTenantCssVars(tenant) : {}

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      // Las CSS variables del tenant se inyectan aquí.
      // Tailwind las usa automáticamente en toda la app.
      style={cssVars as React.CSSProperties}
    >
      <head>
        {/* Manifest dinámico de la PWA — resuelve el Nivel 2 del Blueprint §3 */}
        <link rel="manifest" href="/api/manifest" />
        {tenant?.faviconUrl && <link rel="icon" href={tenant.faviconUrl} />}
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
