/**
 * Seed de datos iniciales para desarrollo.
 * Ejecutar con: pnpm --filter @esquel-activo/db db:seed
 *
 * Crea los tenants reales del ecosistema Esquel Activo.
 */
import { prisma } from './client'

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // ---------------------------------------------------------------------------
  // TENANT #1 — Reina Mora (Panadería y Pastelería)
  // ---------------------------------------------------------------------------
  const reinaMora = await prisma.tenant.upsert({
    where: { slug: 'reina-mora' },
    update: {},
    create: {
      slug: 'reina-mora',
      name: 'Reina Mora',
      brandName: 'Reina Mora',
      schemaName: 'tenant_reina_mora',

      // ----- Identidad Visual -----
      // Logo: colocar el archivo en apps/shell/public/tenants/reina-mora/logo.png
      // y ejecutar el seed nuevamente para actualizar la URL.
      primaryColor: '#0f2c32',    // Verde oscuro de la marca
      secondaryColor: '#c8a2a2',  // Rosa suave (complementario del verde, estilo patisserie)
      logoUrl: '/tenants/reina-mora/logo.png',
      faviconUrl: '/tenants/reina-mora/favicon.png',

      // ----- Contacto -----
      contactPhone: '+542945699613', // WhatsApp: 542945699613
      address: 'Esquel, Chubut, Argentina',

      // ----- Redes Sociales -----
      instagramUrl: 'https://www.instagram.com/reina_mora_patisserie/',

      // ----- Geolocalización -----
      // Google Maps: https://maps.app.goo.gl/...
      latitude: -42.9145972,
      longitude: -71.3164933,

      // ----- WhatsApp Cloud API -----
      // PENDIENTE: Completar en Meta for Developers
      // Pasos:
      //   1. Ir a https://developers.facebook.com/
      //   2. Crear una app de tipo "Business"
      //   3. Agregar el producto "WhatsApp"
      //   4. En "API Setup", copiar el "Phone Number ID" (NO el número de teléfono)
      //   5. Pegar ese ID en el campo whatsappPhoneNumberId
      // whatsappPhoneNumberId: 'COMPLETAR_DESDE_META_FOR_DEVELOPERS',
      // whatsappApiToken guardado en variable de entorno WHATSAPP_API_TOKEN

      // ----- Estado -----
      plan: 'BASIC',
      isActive: true,
    },
  })

  console.log(`✅ Tenant creado: ${reinaMora.name} (slug: ${reinaMora.slug})`)
  console.log(`   Esquema DB: ${reinaMora.schemaName}`)
  console.log(`   Color principal: ${reinaMora.primaryColor}`)
  console.log(`   Teléfono: ${reinaMora.contactPhone ?? 'no configurado'}`)
  console.log(`   Instagram: ${reinaMora.instagramUrl ?? 'no configurado'}`)
  console.log(`   Coordenadas: ${reinaMora.latitude?.toString() ?? '?'}, ${reinaMora.longitude?.toString() ?? '?'}`)
  console.log()
  console.log('📁 PENDIENTE: Copiar logo a:')
  console.log('   apps/shell/public/tenants/reina-mora/logo.png')
  console.log('   apps/shell/public/tenants/reina-mora/favicon.png')
  console.log()
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
