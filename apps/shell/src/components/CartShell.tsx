'use client'

import { CartDrawer } from './CartDrawer'

export function CartShell({ tenantWhatsapp }: { tenantWhatsapp: string | null }) {
  return <CartDrawer tenantWhatsapp={tenantWhatsapp} />
}
