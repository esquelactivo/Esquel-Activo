import type { NextConfig } from 'next'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

const nextConfig: NextConfig = {
  transpilePackages: ['@esquel-activo/ui', '@esquel-activo/tenant-engine'],

  // Next.js hace type-check durante el build — lo desactivamos porque
  // tenemos errores de inferencia interna de next-auth con isolatedModules.
  // El type-check real se corre con `pnpm type-check` por separado.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  webpack: (config, { isServer }) => {
    if (isServer) config.plugins = [...config.plugins, new PrismaPlugin()]
    return config
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
}

export default nextConfig
