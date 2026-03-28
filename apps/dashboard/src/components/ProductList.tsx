'use client'

import { useState, useTransition } from 'react'
import { ProductForm } from './ProductForm'
import { deleteProduct, toggleFeatured, toggleActive } from '@/actions/products'

type Category = { id: string; name: string }

type Product = {
  id: string
  name: string
  description: string | null
  price: string | number
  discountPrice: string | number | null
  isFeatured: boolean
  isActive: boolean
  categoryId: string | null
  imageUrls: string[]
  category: { name: string } | null
}

interface ProductListProps {
  products: Product[]
  categories: Category[]
}

export function ProductList({ products, categories }: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    startTransition(() => deleteProduct(id))
  }

  function handleToggleFeatured(id: string, current: boolean) {
    startTransition(() => toggleFeatured(id, !current))
  }

  function handleToggleActive(id: string, current: boolean) {
    startTransition(() => toggleActive(id, !current))
  }

  return (
    <>
      {/* Botón agregar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Nuevo producto
        </button>
      </div>

      {/* Lista */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-4xl">🛍️</span>
          <p className="font-medium text-gray-700">Todavía no hay productos</p>
          <p className="text-sm text-gray-400">Tocá "Nuevo producto" para agregar el primero</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 transition-opacity ${
                p.isActive ? 'ring-gray-100' : 'opacity-60 ring-gray-100'
              }`}
            >
              {/* Imagen */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {p.imageUrls[0] ? (
                  <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                  {p.isFeatured && <span className="shrink-0 text-sm">⭐</span>}
                </div>
                {p.category && (
                  <p className="text-xs text-gray-400">{p.category.name}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {p.discountPrice ? (
                    <>
                      <span className="text-sm font-bold text-primary">${Number(p.discountPrice).toLocaleString('es-AR')}</span>
                      <span className="text-xs text-gray-400 line-through">${Number(p.price).toLocaleString('es-AR')}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-800">${Number(p.price).toLocaleString('es-AR')}</span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                    disabled={isPending}
                    title={p.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    className={`rounded-lg p-1.5 text-xs transition-colors ${
                      p.isFeatured ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-400'
                    }`}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => { setEditingProduct(p); setShowForm(true) }}
                    className="rounded-lg bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={isPending}
                    className="rounded-lg bg-gray-50 p-1.5 text-red-400 hover:bg-red-50"
                  >
                    <TrashIcon />
                  </button>
                </div>
                {/* Toggle activo */}
                <button
                  onClick={() => handleToggleActive(p.id, p.isActive)}
                  disabled={isPending}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                    p.isActive
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {p.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <ProductForm
          categories={categories}
          product={editingProduct ?? undefined}
          onClose={() => { setShowForm(false); setEditingProduct(null) }}
        />
      )}
    </>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}
