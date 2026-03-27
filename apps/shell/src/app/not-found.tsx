/**
 * Página 404 personalizada.
 * Si el tenant no existe, el usuario ve esta página.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="mt-4 text-xl font-medium text-gray-700">Comercio no encontrado</p>
      <p className="mt-2 text-gray-500">
        El comercio que buscás no existe o no está activo en la plataforma.
      </p>
      <a
        href={`https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'esquel-activo.com.ar'}`}
        className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Ver todos los comercios
      </a>
    </main>
  )
}
