export const metadata = { title: 'Pedidos' }

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>

      {/* Estado vacío */}
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
        <p className="text-4xl">📦</p>
        <p className="mt-3 font-semibold text-gray-700">No hay pedidos aún</p>
        <p className="mt-1 text-sm text-gray-400">
          Cuando llegue un pedido vas a verlo acá en tiempo real
        </p>
      </div>
    </div>
  )
}
