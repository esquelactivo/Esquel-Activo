import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isSuperAdmin: boolean
      tenantId: string | null
      tenantSlug: string | null
      role: string | null
    }
  }

  interface User {
    isSuperAdmin?: boolean
    tenantId?: string | null
    tenantSlug?: string | null
    role?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isSuperAdmin?: boolean
    tenantId?: string | null
    tenantSlug?: string | null
    role?: string | null
  }
}
