/**
 * Seed de datos iniciales para desarrollo.
 * Ejecutar con: pnpm --filter @esquel-activo/db db:seed
 *
 * Crea los tenants de demostración con su configuración visual.
 * Recordá completar aquí con los datos del comercio real de Esquel.
 */
import { prisma } from './client.js'

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // ----- Tenant de demostración -----
  // TODO: Reemplazar con los datos reales del primer comercio
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-esquel' },
    update: {},
    create: {
      slug: 'demo-esquel',
      name: 'Demo Esquel',
      schemaName: 'tenant_demo_esquel',
      primaryColor: '#1a1a2e',
      secondaryColor: '#e94560',
      contactEmail: 'demo@esquel-activo.com.ar',
      plan: 'BASIC',
      isActive: true,
    },
  })

  console.log(`✅ Tenant creado: ${tenant.name} (${tenant.slug})`)
  console.log('🎉 Seed completado.')
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
