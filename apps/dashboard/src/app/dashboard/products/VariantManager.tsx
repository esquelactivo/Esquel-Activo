'use client'

import { useEffect, useState, useTransition } from 'react'
import { getProductVariants, createVariant, updateVariant, deleteVariant } from '@/actions/variants'

type Variant = {
  id: string
  name: string
  price: string
  stock: number
  isActive: boolean
}

export function VariantManager({
  productId,
  productName,
  onClose,
}: {
  productId: string
  productName: string
  onClose: () => void
}) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newStock, setNewStock] = useState('0')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStock, setEditStock] = useState<Record<string, string>>({})

  useEffect(() => {
    getProductVariants(productId).then(v => { setVariants(v); setLoading(false) })
  }, [productId])

  function refresh() {
    getProductVariants(productId).then(setVariants)
  }

  function handleCreate() {
    if (!newName.trim() || !newPrice) return
    startTransition(async () => {
      const res = await createVariant(productId, {
        name: newName.trim(),
        price: Number(newPrice),
        stock: Number(newStock) || 0,
      })
      if (res.success) {
        setNewName(''); setNewPrice(''); setNewStock('0'); setShowAdd(false)
        refresh()
      }
    })
  }

  function handleToggleActive(variant: Variant) {
    startTransition(async () => {
      await updateVariant(variant.id, { isActive: !variant.isActive })
      refresh()
    })
  }

  function handleUpdateStock(variantId: string) {
    const stock = Number(editStock[variantId])
    if (isNaN(stock)) return
    startTransition(async () => {
      await updateVariant(variantId, { stock })
      setEditingId(null)
      refresh()
    })
  }

  function handleDelete(variantId: string, name: string) {
    if (!confirm(`¿Eliminar la variante "${name}"?`)) return
    startTransition(async () => {
      await deleteVariant(variantId)
      refresh()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white shadow-xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">Variantes</h2>
            <p className="text-xs text-gray-400 truncate max-w-[220px]">{productName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-8">Cargando...</p>
          ) : variants.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              Sin variantes aún. Agregá opciones como talles, sabores o colores.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {variants.map(v => (
                <div key={v.id} className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 ${!v.isActive && 'opacity-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">${Number(v.price).toLocaleString('es-AR')}</p>
                  </div>
                  {/* Stock editable */}
                  <div className="flex items-center gap-1.5">
                    {editingId === v.id ? (
                      <>
                        <input
                          type="number"
                          value={editStock[v.id] ?? v.stock}
                          onChange={e => setEditStock(s => ({ ...s, [v.id]: e.target.value }))}
                          className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm text-center outline-none focus:border-primary"
                          min="0"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateStock(v.id)}
                          disabled={isPending}
                          className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white"
                        >
                          ✓
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">✕</button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditingId(v.id); setEditStock(s => ({ ...s, [v.id]: String(v.stock) })) }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          v.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}
                        title="Tocar para editar stock"
                      >
                        {v.stock} uds
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleActive(v)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                    title={v.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {v.isActive ? '👁' : '🚫'}
                  </button>
                  <button
                    onClick={() => handleDelete(v.id, v.name)}
                    disabled={isPending}
                    className="text-red-300 hover:text-red-500 text-sm"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — agregar variante */}
        <div className="border-t border-gray-100 px-5 py-4 shrink-0">
          {showAdd ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Nombre (Talle M, Vainilla…)"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  autoFocus
                />
                <input
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="Precio"
                  type="number"
                  className="w-28 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={newStock}
                  onChange={e => setNewStock(e.target.value)}
                  placeholder="Stock"
                  type="number"
                  min="0"
                  className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={isPending || !newName.trim() || !newPrice}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isPending ? 'Guardando...' : 'Agregar variante'}
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-gray-200 px-4 text-sm text-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
            >
              + Agregar variante
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
