import type { NextAuthConfig } from 'next-auth'

/**
 * Configuración mínima de Auth.js para el middleware (Edge Runtime).
 * NO importa bcryptjs ni @prisma/client — solo verifica el JWT.
 * El middleware corre en Edge y tiene límite de 1 MB de bundle.
 */
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
} satisfies NextAuthConfig
