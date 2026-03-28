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

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002'

/**
 * Header universal fijo — visible en todas las páginas.
 * Contiene el logo de la plataforma, botón de acceso al panel,
 * y el menú grid para navegar entre comercios.
 */
export function Header({ tenants, currentTenantSlug }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <PlatformLogo />

        <div className="flex items-center gap-2">
          <a
            href={`${DASHBOARD_URL}/login`}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Acceder
          </a>
          <UniversalNav tenants={tenants} currentTenantSlug={currentTenantSlug} />
        </div>
      </div>
    </header>
  )
}
