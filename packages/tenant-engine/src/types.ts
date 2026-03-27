/**
 * Configuración del tenant resuelta y lista para usar en el frontend.
 * Este tipo es el "contrato" entre el servidor y el cliente.
 * Nunca debe incluir campos sensibles (tokens, contraseñas).
 */
export type TenantConfig = {
  id: string
  slug: string
  name: string
  brandName: string // Nombre para mostrar (puede ser distinto al nombre interno)

  // Identidad visual — se inyectan como CSS Variables
  primaryColor: string
  secondaryColor: string
  logoUrl: string | null
  faviconUrl: string | null

  // Metadata de contacto
  contactEmail: string | null
  contactPhone: string | null
  address: string | null

  // Capacidades habilitadas para este tenant
  features: TenantFeatures

  // Nombre del esquema PostgreSQL de este tenant
  schemaName: string
}

export type TenantFeatures = {
  hasWhatsApp: boolean        // ¿Tiene WhatsApp Cloud API configurado?
  hasMercadoPago: boolean     // ¿Tiene Mercado Pago configurado?
  hasCustomLogic: boolean     // ¿Tiene Lambda de lógica personalizada?
  hasCustomDomain: boolean    // ¿Tiene dominio propio?
  isEnterpriseApp: boolean    // ¿Es una App nativa white-label (Nivel 2)?
}

/**
 * Resultado de la resolución del tenant desde el Edge Middleware.
 * El middleware analiza el request y devuelve uno de estos estados.
 */
export type TenantResolutionResult =
  | { status: 'found'; tenant: TenantConfig }
  | { status: 'not_found'; slug: string }
  | { status: 'platform' } // La request es al dominio principal, no a un tenant

/**
 * Fuente de donde se extrajo el slug del tenant.
 * Útil para debugging y analytics.
 */
export type TenantResolutionSource =
  | 'subdomain'     // comercio1.esquel-activo.com.ar
  | 'custom_domain' // www.chocolateria-esquel.com.ar
  | 'header'        // x-tenant-id: comercio1 (apps nativas)
  | 'query_param'   // ?tenant=comercio1 (solo en desarrollo)
