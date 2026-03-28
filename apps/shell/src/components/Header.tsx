import { PlatformLogo } from '@/components/PlatformLogo'
import { UniversalNav } from '@/components/UniversalNav'

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
}

/**
 * Header universal fijo — visible en todas las páginas.
 * Contiene el logo de la plataforma y el menú grid,
 * ambos dentro de un contenedor con ancho máximo controlado.
 */
export function Header({ tenants, currentTenantSlug }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <PlatformLogo />
        <UniversalNav tenants={tenants} currentTenantSlug={currentTenantSlug} />
      </div>
    </header>
  )
}
