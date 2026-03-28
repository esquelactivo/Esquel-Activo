import Link from 'next/link'
import { getCurrentTenant } from '@/lib/tenant'
import { prisma } from '@esquel-activo/db'
import { HeroSlideshow } from '@/components/HeroSlideshow'
import { ProductSlideshow } from '@/components/ProductSlideshow'

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
    // Productos destacados para el slideshow
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, price: true, discountPrice: true, imageUrls: true },
    })

    // Productos del catálogo agrupados por categoría
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true, sortOrder: true } } },
    })

    // Agrupar por categoría
    const grouped = new Map<string, { categoryName: string; sortOrder: number; products: typeof allProducts }>()
    const uncategorized: typeof allProducts = []

    for (const p of allProducts) {
      if (p.category) {
        const key = p.categoryId!
        if (!grouped.has(key)) {
          grouped.set(key, { categoryName: p.category.name, sortOrder: p.category.sortOrder, products: [] })
        }
        grouped.get(key)!.products.push(p)
      } else {
        uncategorized.push(p)
      }
    }

    const sections = Array.from(grouped.values()).sort((a, b) => a.sortOrder - b.sortOrder)
    if (uncategorized.length > 0) sections.push({ categoryName: 'Otros', sortOrder: 999, products: uncategorized })

    // Serializar Decimal → string
    const serializeFeatured = featuredProducts.map((p) => ({
      ...p,
      price: p.price.toString(),
      discountPrice: p.discountPrice?.toString() ?? null,
    }))

    return (
      <main
        className="min-h-screen bg-white"
        style={{ '--color-primary': tenant.primaryColor } as React.CSSProperties}
      >
        <div className="mx-auto max-w-2xl px-4 pb-12 pt-20">
          {/* Header del comercio */}
          <div className="mb-6 flex items-center gap-4">
            {tenant.logoUrl && (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-1.5"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tenant.logoUrl} alt={tenant.brandName ?? ''} className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tenant.brandName}</h1>
              {tenant.address && <p className="text-sm text-gray-400">{tenant.address}</p>}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tenant.instagramUrl && (
                  <a href={tenant.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-600 hover:bg-pink-100">
                    Instagram ↗
                  </a>
                )}
                {tenant.latitude && tenant.longitude && (
                  <a href={`https://maps.google.com/?q=${tenant.latitude},${tenant.longitude}`} target="_blank" rel="noopener noreferrer"
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200">
                    Ver en mapa ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Slideshow de destacados */}
          {serializeFeatured.length > 0 && (
            <div className="mb-8">
              <ProductSlideshow products={serializeFeatured} />
            </div>
          )}

          {/* Catálogo */}
          {allProducts.length > 0 ? (
            <div className="flex flex-col gap-8">
              {sections.map((section) => (
                <div key={section.categoryName}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    {section.categoryName}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {section.products.map((p) => (
                      <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="aspect-square bg-gray-50">
                          {p.imageUrls[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl">📦</div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</p>
                          <div className="mt-1">
                            {p.discountPrice ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-primary">
                                  ${Number(p.discountPrice).toLocaleString('es-AR')}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  ${Number(p.price).toLocaleString('es-AR')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-gray-800">
                                ${Number(p.price).toLocaleString('es-AR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 py-12 text-center">
              <span className="text-3xl">🛍️</span>
              <p className="text-sm text-gray-500">El catálogo se está preparando</p>
            </div>
          )}
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
