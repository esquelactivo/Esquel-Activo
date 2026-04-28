import { PlatformLogo } from '@/components/PlatformLogo'
import { UniversalNav } from '@/components/UniversalNav'
import { LoginLink } from '@/components/LoginLink'
import { CartButton } from '@/components/CartButton'

type NavTenant = {
  slug: string
  name: string
  brandName: string | null
  logoUrl: string | null
  primaryColor: string
}

type HeaderProps = {
  tenants: NavTenant[]
  currentTenantSlug: string | null
  isLoggedIn?: boolean
}

export function Header({ tenants, currentTenantSlug, isLoggedIn }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <PlatformLogo />

        <div className="flex items-center gap-2">
          {!isLoggedIn && <LoginLink />}
          <CartButton />
          <UniversalNav tenants={tenants} currentTenantSlug={currentTenantSlug} />
        </div>
      </div>
    </header>
  )
}
