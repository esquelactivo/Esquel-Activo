import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
      }
      return session
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl
      if (pathname === '/profile' || pathname === '/notifications') {
        return isLoggedIn
      }
      return true
    },
  },
} satisfies NextAuthConfig
