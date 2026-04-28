'use server'

import { prisma } from '@esquel-activo/db'
import { revalidatePath } from 'next/cache'

export async function toggleTenantActive(formData: FormData) {
  const tenantId = formData.get('tenantId') as string
  const isActive = formData.get('isActive') === 'true'

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { isActive },
  })

  revalidatePath('/admin/tenants')
}
