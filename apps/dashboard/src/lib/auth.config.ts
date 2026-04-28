import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    session({ session, token }) {
      (session.user as any).isSuperAdmin = (token as any).isSuperAdmin ?? false
      return session
    },
  },
} satisfies NextAuthConfig
