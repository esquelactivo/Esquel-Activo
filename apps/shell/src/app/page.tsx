import Link from 'next/link'
import { getCurrentTenant } from '@/lib/tenant'
import { prisma } from '@esquel-activo/db'
import { HeroSlideshow } from '@/components/HeroSlideshow'

// Slides placeholder — se reemplazarán con datos de la DB cuando esté el Dashboard
const PLACEHOLDER_SLIDES = [
  {
    id: '1',
    imageUrl: null,
    title: 'Bienvenidos a Esquel Activo',
    subtitle: 'Descubrí los mejores comercios de Esquel',
    ctaLabel: 'Ver comercios',
    ctaUrl: '#comercios',
    bgColor: '#0f2c32',
  },
  {
    id: '2',
    imageUrl: null,
    title: 'Promos de temporada',
    subtitle: 'Las mejores ofertas de la ciudad en un solo lugar',
    ctaLabel: null,
    ctaUrl: null,
    bgColor: '#1a3a4a',
  },
  {
    id: '3',
    imageUrl: null,
    title: 'Pedí y retirá',
    subtitle: 'Compras online con retiro en el local',
    ctaLabel: null,
    ctaUrl: null,
    bgColor: '#2d1b4e',
  },
]

/**
 * Obtiene todos los tenants activos para mostrar en el carrusel.
 * Solo trae los campos necesarios para el listado (no datos sensibles).
 */
async function getAllTenants() {
  return prisma.tenant.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      brandName: true,
      logoUrl: true,
      primaryColor: true,
    },
    orderBy: { name: 'asc' },
  })
}

export default async function HomePage() {
  const tenant = await getCurrentTenant()

  // Si estamos dentro de un tenant, mostramos su página
  if (tenant) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          {tenant.logoUrl && (
            <div
              className="flex h-40 w-72 items-center justify-center overflow-hidden rounded-xl p-4"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tenant.logoUrl}
                alt={`Logo de ${tenant.brandName}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold" style={{ color: tenant.primaryColor }}>
              {tenant.brandName}
            </h1>
            {tenant.address && (
              <p className="mt-1 text-sm text-gray-400">{tenant.address}</p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {tenant.features.hasWhatsApp && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                WhatsApp ✓
              </span>
            )}
            {tenant.features.hasMercadoPago && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                Mercado Pago ✓
              </span>
            )}
            {tenant.instagramUrl && (
              <a
                href={tenant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-pink-100 px-3 py-1 text-pink-700 transition-colors hover:bg-pink-200"
              >
                Instagram ↗
              </a>
            )}
            {tenant.latitude && tenant.longitude && (
              <a
                href={`https://maps.google.com/?q=${tenant.latitude.toString()},${tenant.longitude.toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 transition-colors hover:bg-gray-200"
              >
                Ver en mapa ↗
              </a>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Catálogo de productos — próximamente
          </p>
        </div>
      </main>
    )
  }

  // ---- Página principal de la plataforma (sin tenant) ----
  const tenants = await getAllTenants()

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 pt-24">
      {/* Slideshow principal — promos y destacados */}
      <div className="w-full max-w-4xl">
        <HeroSlideshow slides={PLACEHOLDER_SLIDES} />
      </div>

      {/* Carrusel de comercios — estilo historias */}
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Comercios
        </h2>
        <div className="flex gap-5 overflow-x-auto pb-4">
          {tenants.map((t) => (
            <Link
              key={t.slug}
              href={`?tenant=${t.slug}`}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              {/* Anillo con gradiente tipo historia */}
              <div className="rounded-full bg-gradient-to-tr from-pink-400 via-red-400 to-orange-300 p-[3px] transition-transform group-hover:scale-105">
                <div
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-white"
                  style={{ backgroundColor: t.primaryColor }}
                >
                  {t.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.logoUrl}
                      alt={t.brandName ?? t.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {t.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              {/* Nombre debajo */}
              <span className="max-w-[80px] truncate text-center text-xs text-gray-600">
                {t.brandName ?? t.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
