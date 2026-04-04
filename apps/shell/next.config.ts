import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Permite importar componentes del package @esquel-activo/ui
  transpilePackages: ['@esquel-activo/ui', '@esquel-activo/tenant-engine'],

  // Necesario para que Next.js encuentre el binario de Prisma en el monorepo
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
