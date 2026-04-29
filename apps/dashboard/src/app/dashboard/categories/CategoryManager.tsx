'use client'

import { useState, useTransition, useRef } from 'react'
import { createCategory, updateCategory, deleteCategory, toggleCategoryActive } from './actions'

type Category = {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  _count: { products: number }
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await createCategory(formData)
      if (res.success) { setShowForm(false); formRef.current?.reset() }
      else setError(res.error ?? 'Error')
    })
  }

  function handleUpdate(formData: FormData) {
    if (!editing) return
    setError(null)
    startTransition(async () => {
      const res = await updateCategory(editing.id, formData)
      if (res.success) setEditing(null)
      else setError(res.error ?? 'Error')
    })
  }

  function handleDelete(id: string, name: string, productCount: number) {
    if (productCount > 0) {
      alert(`No podés eliminar "${name}" porque tiene ${productCount} producto${productCount > 1 ? 's' : ''} asociado${productCount > 1 ? 's' : ''}. Reasigná los productos primero.`)
      return
    }
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return
    startTransition(async () => { await deleteCategory(id) })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleCategoryActive(id, !current) })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} categoría{categories.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowForm(true); setEditing(null) }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          + Nueva categoría
        </button>
      </div>

      {/* Lista */}
      {categories.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-4xl">🏷️</span>
          <p className="font-medium text-gray-700">Todavía no hay categorías</p>
          <p className="text-sm text-gray-400">Creá categorías para organizar tu catálogo</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-opacity ${!cat.isActive && 'opacity-60'}`}>
              {editing?.id === cat.id ? (
                <CategoryForm
                  defaultValues={cat}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(null)}
                  isPending={isPending}
                  error={error}
                  submitLabel="Guardar cambios"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                      <span className="text-xs text-gray-400">
                        {cat._count.products} producto{cat._count.products !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{cat.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Orden: {cat.sortOrder}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(cat.id, cat.isActive)}
                      disabled={isPending}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {cat.isActive ? 'Activa' : 'Inactiva'}
                    </button>
                    <button
                      onClick={() => { setEditing(cat); setError(null) }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                      disabled={isPending}
                      className="rounded-lg p-2 text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario de nueva categoría */}
      {showForm && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary/30">
          <p className="mb-4 font-semibold text-gray-900">Nueva categoría</p>
          <CategoryForm
            ref={formRef}
            onSubmit={handleCreate}
            onCancel={() => { setShowForm(false); setError(null) }}
            isPending={isPending}
            error={error}
            submitLabel="Crear categoría"
          />
        </div>
      )}
    </div>
  )
}

import { forwardRef } from 'react'

const CategoryForm = forwardRef<HTMLFormElement, {
  defaultValues?: { name: string; description: string | null; sortOrder: number }
  onSubmit: (formData: FormData) => void
  onCancel: () => void
  isPending: boolean
  error: string | null
  submitLabel: string
}>(function CategoryForm({ defaultValues, onSubmit, onCancel, isPending, error, submitLabel }, ref) {
  return (
    <form ref={ref} action={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Nombre *</label>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="Ej: Remeras, Tortas, Electrónica"
          className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Descripción</label>
        <input
          name="description"
          defaultValue={defaultValues?.description ?? ''}
          placeholder="Opcional"
          className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Orden (menor número = primero)</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={defaultValues?.sortOrder ?? 0}
          className="w-24 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {isPending ? 'Guardando...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
})
