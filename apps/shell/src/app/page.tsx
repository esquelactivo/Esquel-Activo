import { getCurrentTenant } from '@/lib/tenant'

export default async function HomePage() {
  const tenant = await getCurrentTenant()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-8">
      {tenant ? (
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Logo del tenant */}
          {tenant.logoUrl && (
            <div
              className="flex h-32 w-64 items-center justify-center rounded-xl p-4"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tenant.logoUrl}
                alt={`Logo de ${tenant.brandName}`}
                className="h-full w-full object-contain"
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

          {/* Badges de integraciones activas */}
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

          {/* Catálogo — Fase 2 */}
          <p className="mt-4 text-sm text-gray-400">
            Catálogo de productos — próximamente
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold text-[#0f2c32]">Esquel Activo</h1>
          <p className="text-gray-500">Ecosistema digital de comercios de Esquel</p>
        </div>
      )}
    </main>
  )
}
