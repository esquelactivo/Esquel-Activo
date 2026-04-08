import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      tenantId: string | null
      tenantSlug: string | null
      role: string | null
    }
  }

  interface User {
    tenantId?: string | null
    tenantSlug?: string | null
    role?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId?: string | null
    tenantSlug?: string | null
    role?: string | null
  }
}
