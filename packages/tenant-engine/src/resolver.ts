/**
 * Lógica de resolución del tenant.
 *
 * PRIORIDAD DE RESOLUCIÓN (de mayor a menor):
 *   1. Header x-tenant-id  → Apps nativas Capacitor
 *   2. Dominio propio       → www.chocolateria-esquel.com.ar
 *   3. Subdominio           → chocolateria.esquel-activo.com.ar
 *   4. Query param ?tenant= → Solo en desarrollo local
 *
 * Esta función corre en el Edge Runtime de Next.js (middleware.ts)
 * por lo que NO puede usar Node.js APIs. Solo Web APIs + fetch.
 */
import type { TenantConfig, TenantResolutionResult, TenantResolutionSource } from './types.js'

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'esquel-activo.com.ar'

/**
 * Extrae el slug del tenant de una URL de request.
 * Devuelve null si la request es al dominio principal (plataforma).
 */
export function extractTenantSlug(
  hostname: string,
  searchParams: URLSearchParams,
  headers: Headers
): { slug: string; source: TenantResolutionSource } | null {
  // 1. Header de aplicación nativa (máxima prioridad)
  const headerTenantId = headers.get('x-tenant-id')
  if (headerTenantId) {
    return { slug: headerTenantId, source: 'header' }
  }

  // 2. Subdominio de la plataforma
  if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${PLATFORM_DOMAIN}`, '')
    // "www" o el dominio principal no son tenants
    if (subdomain && subdomain !== 'www') {
      return { slug: subdomain, source: 'subdomain' }
    }
    return null // Es el dominio principal
  }

  // 3. Dominio propio (no es el dominio de la plataforma)
  if (hostname !== PLATFORM_DOMAIN && hostname !== `www.${PLATFORM_DOMAIN}`) {
    // La lookup del dominio propio requiere consultar la DB
    // Devolvemos el hostname completo como "slug" para que
    // la función resolveTenantByDomain lo busque correctamente
    return { slug: hostname, source: 'custom_domain' }
  }

  // 4. Query param solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    const tenantParam = searchParams.get('tenant')
    if (tenantParam) {
      return { slug: tenantParam, source: 'query_param' }
    }
  }

  return null // Dominio principal de la plataforma
}

/**
 * Convierte un modelo Tenant de la DB en un TenantConfig seguro
 * (sin campos sensibles como tokens).
 */
export function toTenantConfig(
  tenant: {
    id: string
    slug: string
    name: string
    brandName: string | null
    schemaName: string
    primaryColor: string
    secondaryColor: string
    logoUrl: string | null
    faviconUrl: string | null
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    customDomain: string | null
    customLogicUrl: string | null
    whatsappPhoneNumberId: string | null
    mpAccessToken: string | null
    plan: string
  }
): TenantConfig {
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    brandName: tenant.brandName ?? tenant.name,
    schemaName: tenant.schemaName,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    logoUrl: tenant.logoUrl,
    faviconUrl: tenant.faviconUrl,
    contactEmail: tenant.contactEmail,
    contactPhone: tenant.contactPhone,
    address: tenant.address,
    features: {
      hasWhatsApp: Boolean(tenant.whatsappPhoneNumberId),
      hasMercadoPago: Boolean(tenant.mpAccessToken),
      hasCustomLogic: Boolean(tenant.customLogicUrl),
      hasCustomDomain: Boolean(tenant.customDomain),
      isEnterpriseApp: tenant.plan === 'ENTERPRISE',
    },
  }
}

/**
 * Genera el objeto de variables CSS para inyectar el tema del tenant
 * en el elemento <html> del documento.
 *
 * Uso en layout.tsx:
 *   <html style={getTenantCssVars(tenant)}>
 */
export function getTenantCssVars(tenant: TenantConfig): Record<string, string> {
  return {
    '--color-primary': tenant.primaryColor,
    '--color-secondary': tenant.secondaryColor,
  }
}

export type { TenantConfig, TenantFeatures, TenantResolutionResult, TenantResolutionSource } from './types.js'
