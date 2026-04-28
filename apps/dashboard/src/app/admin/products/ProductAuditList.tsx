'use client'

import { useState, useTransition } from 'react'
import { createNotification } from '../notifications/actions'

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  discountPrice: string | null
  imageUrls: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  tenant: { id: string; name: string; slug: string; primaryColor: string }
  category: { name: string } | null
}

type Tenant = { id: string; name: string; slug: string }

export function ProductAuditList({ products, tenants }: { products: Product[]; tenants: Tenant[] }) {
  const [search, setSearch] = useState('')
  const [tenantFilter, setTenantFilter] = useState('')
  const [detail, setDetail] = useState<Product | null>(null)
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null)

  const filtered = products.filter(p => {
    if (tenantFilter && p.tenant.id !== tenantFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="rounded-xl bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 w-56"
        />
        <select
          value={tenantFilter}
          onChange={e => setTenantFilter(e.target.value)}
          className="rounded-xl bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Todos los comercios</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <span className="text-xs text-gray-500 self-center">{filtered.length} productos</span>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Comercio</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filtered.map(p => (
              <tr key={p.id} className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.imageUrls[0] ? (
                      <img src={p.imageUrls[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-lg shrink-0">📦</div>
                    )}
                    <div>
                      <p className="font-medium text-white">{p.name}</p>
                      {p.category && <p className="text-xs text-gray-500">{p.category.name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-gray-300">{p.tenant.name}</span>
                </td>
                <td className="px-5 py-3">
                  <div>
                    {p.discountPrice ? (
                      <>
                        <p className="text-sm font-semibold text-orange-400">${Number(p.discountPrice).toLocaleString('es-AR')}</p>
                        <p className="text-xs text-gray-500 line-through">${Number(p.price).toLocaleString('es-AR')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-white">${Number(p.price).toLocaleString('es-AR')}</p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${p.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    {p.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 w-fit">Destacado</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetail(p)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                      Detalle
                    </button>
                    <button
                      onClick={() => setNotifyProduct(p)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-900/30 text-orange-400 hover:bg-orange-900/50 transition-colors"
                    >
                      🔔 Notificar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm">Sin productos</div>
        )}
      </div>

      {/* Modal detalle */}
      {detail && (
        <ProductDetailModal product={detail} onClose={() => setDetail(null)} onNotify={() => { setDetail(null); setNotifyProduct(detail) }} />
      )}

      {/* Modal notificación */}
      {notifyProduct && (
        <NotifyProductModal product={notifyProduct} tenants={tenants} onClose={() => setNotifyProduct(null)} />
      )}
    </>
  )
}

function ProductDetailModal({ product: p, onClose, onNotify }: { product: Product; onClose: () => void; onNotify: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-gray-800 border border-gray-700 shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
          <h2 className="text-lg font-bold text-white">Detalle del producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Imágenes */}
          {p.imageUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {p.imageUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="h-32 w-32 rounded-xl object-cover shrink-0" />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" value={p.name} />
            <Field label="Comercio" value={p.tenant.name} />
            <Field label="Precio" value={`$${Number(p.price).toLocaleString('es-AR')}`} />
            {p.discountPrice && <Field label="Precio oferta" value={`$${Number(p.discountPrice).toLocaleString('es-AR')}`} />}
            <Field label="Categoría" value={p.category?.name ?? '—'} />
            <Field label="Estado" value={p.isActive ? 'Activo' : 'Inactivo'} />
            <Field label="Destacado" value={p.isFeatured ? 'Sí' : 'No'} />
            <Field label="Creado" value={new Date(p.createdAt).toLocaleDateString('es-AR')} />
          </div>

          {p.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Descripción</p>
              <p className="text-sm text-gray-300 leading-relaxed">{p.description}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-700 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-600 text-gray-300 text-sm hover:bg-gray-700 transition-colors">
            Cerrar
          </button>
          <button onClick={onNotify} className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
            🔔 Notificar
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  )
}

function NotifyProductModal({ product, tenants, onClose }: { product: Product; tenants: Tenant[]; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createNotification(formData)
      if (result.success) onClose()
      else setError(result.error ?? 'Error')
    })
  }

  const defaultTitle = `Mirá este producto: ${product.name}`
  const defaultBody = `${product.description ?? ''}\n\nPrecio: $${Number(product.discountPrice ?? product.price).toLocaleString('es-AR')}`
  const defaultImage = product.imageUrls[0] ?? ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Notificar sobre producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-gray-700/50 flex items-center gap-3">
          {product.imageUrls[0] && (
            <img src={product.imageUrls[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">{product.name}</p>
            <p className="text-xs text-gray-400">{product.tenant.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Título</label>
            <input name="title" required defaultValue={defaultTitle}
              className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Mensaje</label>
            <textarea name="body" required rows={3} defaultValue={defaultBody.trim()}
              className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>
          <input type="hidden" name="imageUrl" value={defaultImage} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Destinatarios</label>
            <select name="targetType" defaultValue="TENANT"
              className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="ALL">Todos</option>
              <option value="CLIENTS">Solo clientes</option>
              <option value="BUSINESSES">Solo comercios</option>
              <option value="TENANT">Solo usuarios de {product.tenant.name}</option>
            </select>
          </div>
          <input type="hidden" name="tenantId" value={product.tenant.id} />
          {error && <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-gray-600 text-gray-300 text-sm hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors">
              {isPending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
