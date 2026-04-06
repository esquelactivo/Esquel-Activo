/**
 * Lógica de resolución del tenant.
 *
 * PRIORIDAD DE RESOLUCIÓN (de mayor a menor):
 *   1. Header x-tenant-id  → Apps nativas Capacitor
 *   2. Query param ?tenant= → Solo en desarrollo local
 *   3. Subdominio           → chocolateria.esquel-activo.com.ar
 *   4. Dominio propio       → www.chocolateria-esquel.com.ar
 *
 * Esta función corre en el Edge Runtime de Next.js (middleware.ts)
 * por lo que NO puede usar Node.js APIs. Solo Web APIs + fetch.
 */
import type { TenantConfig, TenantResolutionResult, TenantResolutionSource } from './types'

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'esquel-activo.com.ar'

// Hostnames que NO son dominios propios de tenants
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

// Sufijos de plataformas de hosting que no son dominios propios
const PLATFORM_SUFFIXES = ['.vercel.app', '.netlify.app', '.pages.dev']

/**
 * Extrae el slug del tenant de una URL de request.
 * Devuelve null si la request es al dominio principal (plataforma).
 */
export function extractTenantSlug(
  hostname: string,
  searchParams: URLSearchParams,
  headers: Headers
): { slug: string; source: TenantResolutionSource } | null {
  // Remover el puerto del hostname (localhost:3000 → localhost)
  const cleanHostname = hostname.split(':')[0] ?? hostname

  // 1. Header de aplicación nativa (máxima prioridad)
  const headerTenantId = headers.get('x-tenant-id')
  if (headerTenantId) {
    return { slug: headerTenantId, source: 'header' }
  }

  // 2. Query param — funciona en desarrollo y en producción (hasta tener subdominios)
  const tenantParam = searchParams.get('tenant')
  if (tenantParam) {
    return { slug: tenantParam, source: 'query_param' }
  }

  // 3. Subdominio de la plataforma
  if (cleanHostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = cleanHostname.replace(`.${PLATFORM_DOMAIN}`, '')
    if (subdomain && subdomain !== 'www') {
      return { slug: subdomain, source: 'subdomain' }
    }
    return null // Es el dominio principal
  }

  // 4. Dominio propio (excluir hosts locales, plataforma y dominios de hosting)
  const isLocalHost = LOCAL_HOSTS.has(cleanHostname)
  const isPlatformDomain =
    cleanHostname === PLATFORM_DOMAIN || cleanHostname === `www.${PLATFORM_DOMAIN}`
  const isHostingDomain = PLATFORM_SUFFIXES.some((suffix) => cleanHostname.endsWith(suffix))

  if (!isLocalHost && !isPlatformDomain && !isHostingDomain) {
    return { slug: cleanHostname, source: 'custom_domain' }
  }

  return null // Dominio principal de la plataforma o localhost sin ?tenant=
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
    instagramUrl: string | null
    facebookUrl: string | null
    latitude: number | null
    longitude: number | null
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
    instagramUrl: tenant.instagramUrl,
    facebookUrl: tenant.facebookUrl,
    latitude: tenant.latitude,
    longitude: tenant.longitude,
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

export type { TenantConfig, TenantFeatures, TenantResolutionResult, TenantResolutionSource } from './types'
