'use client'

import { createContext, useContext, ReactNode } from 'react'

export type NavTenant = {
  slug: string
  name: string
  brandName: string | null
  logoUrl: string | null
  primaryColor: string
}

type NavContextType = {
  tenants: NavTenant[]
  currentTenantSlug: string | null
}

const NavContext = createContext<NavContextType>({ tenants: [], currentTenantSlug: null })

export function NavProvider({
  children,
  tenants,
  currentTenantSlug,
}: { children: ReactNode } & NavContextType) {
  return (
    <NavContext.Provider value={{ tenants, currentTenantSlug }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
