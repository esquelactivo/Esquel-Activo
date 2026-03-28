import Link from 'next/link'

export const metadata = { title: 'Productos' }

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <span>+</span> Agregar
        </Link>
      </div>

      {/* Estado vacío */}
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
        <p className="text-4xl">🛍️</p>
        <p className="mt-3 font-semibold text-gray-700">Todavía no tenés productos</p>
        <p className="mt-1 text-sm text-gray-400">
          Agregá tu primer producto para que aparezca en tu tienda
        </p>
        <Link
          href="/dashboard/products/new"
          className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Agregar primer producto
        </Link>
      </div>
    </div>
  )
}
