import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith('/api/setup')) {
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth
  const isSuperAdmin = (req.auth?.user as any)?.isSuperAdmin === true
  const { pathname } = req.nextUrl

  const isLoginPage = pathname === '/login'
  const isAdminRoute = pathname.startsWith('/admin')
  const isDashboardRoute = pathname.startsWith('/dashboard')

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL(isSuperAdmin ? '/admin' : '/dashboard', req.url))
  }

  // Solo super admin puede acceder a /admin
  if (isAdminRoute && !isSuperAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Super admin va directo a /admin si intenta ir a /dashboard
  if (isDashboardRoute && isSuperAdmin) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/setup).*)'],
}
