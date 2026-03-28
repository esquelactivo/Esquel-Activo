'use client'

import { useRef, useState, useTransition } from 'react'
import { createProduct, updateProduct } from '@/actions/products'

type Category = { id: string; name: string }

type Product = {
  id: string
  name: string
  description: string | null
  price: string | number
  discountPrice: string | number | null
  isFeatured: boolean
  categoryId: string | null
  imageUrls: string[]
}

interface ProductFormProps {
  categories: Category[]
  product?: Product        // si viene = modo edición
  onClose: () => void
}

export function ProductForm({ categories, product, onClose }: ProductFormProps) {
  const isEdit = !!product
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrls[0] ?? null
  )
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('isFeatured', isFeatured ? 'true' : 'false')

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)

      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? 'Error desconocido')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {/* Imagen */}
          <div
            className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-primary/50"
            onClick={() => imageInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <CameraIcon />
                <span className="text-xs">Agregar foto</span>
              </div>
            )}
          </div>
          <input
            ref={imageInputRef}
            name="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {/* Nombre */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Nombre *</label>
            <input
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Ej: Medialunas de manteca"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Descripción</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={product?.description ?? ''}
              placeholder="Descripción breve del producto..."
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Precio *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={product ? String(product.price) : ''}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Precio oferta</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  name="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={product?.discountPrice ? String(product.discountPrice) : ''}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Categoría */}
          {categories.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Categoría</label>
              <select
                name="categoryId"
                defaultValue={product?.categoryId ?? ''}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Destacado */}
          <button
            type="button"
            onClick={() => setIsFeatured(!isFeatured)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              isFeatured
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-xl">{isFeatured ? '⭐' : '☆'}</span>
            <div>
              <p className={`text-sm font-medium ${isFeatured ? 'text-amber-700' : 'text-gray-700'}`}>
                Producto destacado
              </p>
              <p className="text-xs text-gray-400">Aparece en el slideshow principal del comercio</p>
            </div>
          </button>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
