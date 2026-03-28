import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { template: '%s | Esquel Activo', default: 'Panel de gestión' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geistSans.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
