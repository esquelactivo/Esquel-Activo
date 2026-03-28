import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@esquel-activo/db'
import { compare } from 'bcryptjs'
import { z } from 'zod'

/**
 * Auth.js v5 — Configuración de autenticación del Dashboard.
 *
 * Usa Credentials (email + contraseña) como proveedor principal.
 * La sesión incluye el tenant del usuario para que cada propietario
 * solo vea los datos de su comercio.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            memberships: {
              include: { tenant: true },
              take: 1,
            },
          },
        })

        if (!user?.passwordHash) return null

        const valid = await compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        const membership = user.memberships[0]

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: membership?.tenantId ?? null,
          tenantSlug: membership?.tenant.slug ?? null,
          role: membership?.role ?? null,
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as any).tenantId
        token.tenantSlug = (user as any).tenantSlug
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      session.user.tenantId = token.tenantId as string | null
      session.user.tenantSlug = token.tenantSlug as string | null
      session.user.role = token.role as string | null
      return session
    },
  },
})
