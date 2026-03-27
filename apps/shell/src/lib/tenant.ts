/**
 * Helpers del servidor para obtener la configuración del tenant.
 * Solo se usa en Server Components y API Routes (tiene acceso a Prisma).
 */
import { headers } from 'next/headers'
import { cache } from 'react'
import { prisma } from '@esquel-activo/db'
import { toTenantConfig, type TenantConfig } from '@esquel-activo/tenant-engine'

/**
 * Obtiene la configuración del tenant actual basándose en el header
 * inyectado por el middleware.
 *
 * React.cache() garantiza que por cada request, la DB se consulte
 * UNA SOLA VEZ aunque múltiples componentes llamen a esta función.
 * Esto es el "request memoization" de Next.js.
 */
export const getCurrentTenant = cache(async (): Promise<TenantConfig | null> => {
  const headersList = await headers()
  const slug = headersList.get('x-resolved-tenant-slug')
  const source = headersList.get('x-tenant-resolution-source')

  if (!slug) return null

  // Buscar por dominio propio o por slug
  const tenant = await prisma.tenant.findFirst({
    where: source === 'custom_domain'
      ? { customDomain: slug, isActive: true }
      : { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      brandName: true,
      schemaName: true,
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      faviconUrl: true,
      contactEmail: true,
      contactPhone: true,
      address: true,
      instagramUrl: true,
      facebookUrl: true,
      latitude: true,
      longitude: true,
      customDomain: true,
      customLogicUrl: true,
      whatsappPhoneNumberId: true,
      mpAccessToken: true,
      plan: true,
    },
  })

  if (!tenant) return null

  return toTenantConfig(tenant)
})
