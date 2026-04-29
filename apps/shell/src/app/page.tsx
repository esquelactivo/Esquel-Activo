import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'
import { getCurrentTenant } from '@/lib/tenant'
import { prisma } from '@esquel-activo/db'
import { HeroSlideshow } from '@/components/HeroSlideshow'
import { TenantCatalog } from '@/components/TenantCatalog'
import { ProductDetailPage } from '@/components/ProductDetailPage'

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

// Caché de 60 segundos — la lista de comercios no cambia seguido
const getAllTenants = unstable_cache(
  () => prisma.tenant.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, brandName: true, logoUrl: true, primaryColor: true },
    orderBy: { name: 'asc' },
  }),
  ['all-tenants'],
  { revalidate: 60 }
)

// Caché de 30 segundos por tenant — se invalida al guardar productos
const getTenantProducts = unstable_cache(
  async (tenantId: string) => {
    const [featuredRaw, allProductsRaw] = await Promise.all([
      prisma.product.findMany({
        where: { tenantId, isFeatured: true, isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, description: true, price: true, discountPrice: true, imageUrls: true,
          variants: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            select: { id: true, name: true, price: true, stock: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, sortOrder: true } },
          variants: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            select: { id: true, name: true, price: true, stock: true },
          },
        },
      }),
    ])
    return { featuredRaw, allProductsRaw }
  },
  ['tenant-products'],
  { revalidate: 30 }
)

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const tenant = await getCurrentTenant()
  const { p: productId } = await searchParams

  // ---- Vista de detalle de producto ----
  if (tenant && productId) {
    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId: tenant.id, isActive: true },
      select: {
        id: true, name: true, description: true, price: true, discountPrice: true,
        imageUrls: true,
        category: { select: { name: true } },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          select: { id: true, name: true, price: true, stock: true },
        },
      },
    })

    if (product) {
      const serialized = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() ?? null,
        imageUrls: product.imageUrls,
        category: product.category,
        variants: product.variants.map(v => ({ ...v, price: v.price.toString() })),
      }
      return (
        <main
          className="mx-auto max-w-2xl"
          style={{ '--color-primary': tenant.primaryColor } as React.CSSProperties}
        >
          <Suspense>
            <ProductDetailPage product={serialized} tenantWhatsapp={tenant.contactPhone} />
          </Suspense>
        </main>
      )
    }
  }

  if (tenant) {
    const { featuredRaw, allProductsRaw } = await getTenantProducts(tenant.id)

    // Agrupar por categoría
    const grouped = new Map<string, { categoryName: string; sortOrder: number; products: typeof allProductsRaw }>()
    const uncategorized: typeof allProductsRaw = []
    for (const p of allProductsRaw) {
      if (p.category) {
        const key = p.categoryId!
        if (!grouped.has(key)) grouped.set(key, { categoryName: p.category.name, sortOrder: p.category.sortOrder, products: [] })
        grouped.get(key)!.products.push(p)
      } else {
        uncategorized.push(p)
      }
    }
    const sections = Array.from(grouped.values()).sort((a, b) => a.sortOrder - b.sortOrder)
    if (uncategorized.length > 0) sections.push({ categoryName: 'Otros', sortOrder: 999, products: uncategorized })

    // Serializar Decimal → string (no se puede pasar Decimal a Client Components)
    const serializeVariants = (variants: { id: string; name: string; price: { toString(): string }; stock: number }[]) =>
      variants.map(v => ({ id: v.id, name: v.name, price: v.price.toString(), stock: v.stock }))

    const featured = featuredRaw.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      discountPrice: p.discountPrice?.toString() ?? null,
      imageUrls: p.imageUrls,
      category: null,
      variants: serializeVariants(p.variants),
    }))
    const serializedSections = sections.map((s) => ({
      categoryName: s.categoryName,
      sortOrder: s.sortOrder,
      products: s.products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price.toString(),
        discountPrice: p.discountPrice?.toString() ?? null,
        imageUrls: p.imageUrls,
        category: p.category,
        variants: serializeVariants(p.variants),
      })),
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
                {tenant.googleBusinessUrl && (
                  <a href={tenant.googleBusinessUrl} target="_blank" rel="noopener noreferrer"
                    className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-100">
                    Google ↗
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

          {/* Catálogo con slideshow interactivo */}
          <Suspense>
            <TenantCatalog
              featuredProducts={featured}
              sections={serializedSections}
            />
          </Suspense>
        </div>
      </main>
    )
  }

  // ---- Página principal de la plataforma ----
  const tenants = await getAllTenants()

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 pt-24">
      <div className="w-full max-w-4xl">
        <HeroSlideshow slides={PLACEHOLDER_SLIDES} />
      </div>

      <div className="mt-8 w-full max-w-4xl">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Comercios</h2>
        <div className="flex gap-5 overflow-x-auto pb-4">
          {tenants.map((t) => (
            <Link key={t.slug} href={`?tenant=${t.slug}`} className="group flex shrink-0 flex-col items-center gap-2">
              <div className="rounded-full bg-gradient-to-tr from-pink-400 via-red-400 to-orange-300 p-[3px] transition-transform group-hover:scale-105">
                <div
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-white"
                  style={{ backgroundColor: t.primaryColor }}
                >
                  {t.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logoUrl} alt={t.brandName ?? t.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{t.name.charAt(0)}</span>
                  )}
                </div>
              </div>
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
