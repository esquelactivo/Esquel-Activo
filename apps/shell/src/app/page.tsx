import { getCurrentTenant } from '@/lib/tenant'

export default async function HomePage() {
  const tenant = await getCurrentTenant()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {tenant ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">{tenant.brandName}</h1>
          <p className="mt-2 text-gray-500">Bienvenido a {tenant.name}</p>
          <div className="mt-4 flex gap-2 justify-center text-sm text-gray-400">
            <span className="rounded bg-gray-100 px-2 py-1">slug: {tenant.slug}</span>
            {tenant.features.hasMercadoPago && (
              <span className="rounded bg-green-100 px-2 py-1 text-green-700">MP ✓</span>
            )}
            {tenant.features.hasWhatsApp && (
              <span className="rounded bg-green-100 px-2 py-1 text-green-700">WA ✓</span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Esquel Activo</h1>
          <p className="mt-2 text-gray-500">Ecosistema digital de comercios</p>
        </div>
      )}
    </main>
  )
}
