import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite importar componentes del package @esquel-activo/ui
  transpilePackages: ['@esquel-activo/ui', '@esquel-activo/tenant-engine'],

  images: {
    // Dominios permitidos para next/image (agregar CDN en producción)
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    // Formatos modernos — crítico para performance en zonas con 4G (Blueprint §8)
    formats: ['image/avif', 'image/webp'],
  },

  // Cabeceras de seguridad
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
