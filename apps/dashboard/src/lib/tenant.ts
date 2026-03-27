import { headers } from 'next/headers'
import { cache } from 'react'
import { prisma } from '@esquel-activo/db'
import { toTenantConfig, type TenantConfig } from '@esquel-activo/tenant-engine'

export const getCurrentTenant = cache(async (): Promise<TenantConfig | null> => {
  const headersList = await headers()
  const slug = headersList.get('x-resolved-tenant-slug')
  const source = headersList.get('x-tenant-resolution-source')

  if (!slug) return null

  const tenant = await prisma.tenant.findFirst({
    where: source === 'custom_domain' ? { customDomain: slug, isActive: true } : { slug, isActive: true },
    select: {
      id: true, slug: true, name: true, brandName: true, schemaName: true,
      primaryColor: true, secondaryColor: true, logoUrl: true, faviconUrl: true,
      contactEmail: true, contactPhone: true, address: true, customDomain: true,
      customLogicUrl: true, whatsappPhoneNumberId: true, mpAccessToken: true, plan: true,
    },
  })

  return tenant ? toTenantConfig(tenant) : null
})
