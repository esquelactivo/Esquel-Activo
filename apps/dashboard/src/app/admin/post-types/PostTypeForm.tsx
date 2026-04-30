'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPostType, updatePostType } from './actions'

type Field = {
  id?: string
  name: string
  key: string
  type: string
  required: boolean
  placeholder: string
}

type PostType = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  isActive: boolean
  fields: Field[]
}

const FIELD_TYPES = [
  { value: 'TEXT',     label: 'Texto corto' },
  { value: 'TEXTAREA', label: 'Texto largo' },
  { value: 'IMAGE',    label: 'Imagen (URL)' },
  { value: 'URL',      label: 'Enlace (URL)' },
  { value: 'DATE',     label: 'Fecha' },
  { value: 'NUMBER',   label: 'Número' },
  { value: 'BOOLEAN',  label: 'Sí / No' },
]

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function PostTypeForm({ postType }: { postType?: PostType }) {
  const router = useRouter()
  const isEdit = !!postType
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(postType?.name ?? '')
  const [slug, setSlug] = useState(postType?.slug ?? '')
  const [description, setDescription] = useState(postType?.description ?? '')
  const [icon, setIcon] = useState(postType?.icon ?? '')
  const [isActive, setIsActive] = useState(postType?.isActive ?? true)
  const [fields, setFields] = useState<Field[]>(postType?.fields ?? [])

  function handleNameChange(v: string) {
    setName(v)
    if (!isEdit) setSlug(toSlug(v))
  }

  function addField() {
    setFields(f => [...f, { name: '', key: '', type: 'TEXT', required: false, placeholder: '' }])
  }

  function removeField(i: number) {
    setFields(f => f.filter((_, idx) => idx !== i))
  }

  function updateField(i: number, patch: Partial<Field>) {
    setFields(f => f.map((field, idx) => {
      if (idx !== i) return field
      const updated = { ...field, ...patch }
      if (patch.name !== undefined && !isEdit) updated.key = toSlug(patch.name).replace(/-/g, '_')
      return updated
    }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('fields', JSON.stringify(fields.map((f, i) => ({ ...f, sortOrder: i }))))
    if (isEdit) fd.set('isActive', String(isActive))

    startTransition(async () => {
      const result = isEdit
        ? await updatePostType(postType.id, fd)
        : await createPostType(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Datos básicos */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800/30 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Información del tipo</h2>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-gray-300">Nombre</label>
            <input
              name="name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              required
              placeholder="ej: Noticia"
              className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-24">
            <label className="text-sm font-medium text-gray-300">Ícono</label>
            <input
              name="icon"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="📰"
              className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Slug <span className="text-gray-500 font-normal">(identificador único en URL)</span></label>
          <input
            name="slug"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            placeholder="ej: noticia"
            className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Descripción <span className="text-gray-500 font-normal">(opcional)</span></label>
          <textarea
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Para qué usan este tipo de contenido los comercios..."
            className="rounded-xl bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {isEdit && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(v => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isActive ? 'bg-orange-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-gray-300">{isActive ? 'Activo' : 'Inactivo'}</span>
          </div>
        )}
      </div>

      {/* Editor de campos */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Campos del tipo</h2>
          <button
            type="button"
            onClick={addField}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            + Agregar campo
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Sin campos extra — solo tendrá el título. Agregá campos para enriquecer el contenido.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, i) => (
              <div key={i} className="rounded-xl bg-gray-700/50 border border-gray-600 p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-gray-400">Nombre del campo</label>
                    <input
                      value={field.name}
                      onChange={e => updateField(i, { name: e.target.value })}
                      placeholder="ej: Descripción"
                      className="rounded-lg bg-gray-700 border border-gray-600 text-white px-2.5 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-36">
                    <label className="text-xs text-gray-400">Clave interna</label>
                    <input
                      value={field.key}
                      onChange={e => updateField(i, { key: e.target.value })}
                      placeholder="ej: description"
                      className="rounded-lg bg-gray-700 border border-gray-600 text-white px-2.5 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-36">
                    <label className="text-xs text-gray-400">Tipo</label>
                    <select
                      value={field.type}
                      onChange={e => updateField(i, { type: e.target.value })}
                      className="rounded-lg bg-gray-700 border border-gray-600 text-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-gray-400">Placeholder <span className="text-gray-600">(opcional)</span></label>
                    <input
                      value={field.placeholder}
                      onChange={e => updateField(i, { placeholder: e.target.value })}
                      placeholder="Texto de ayuda en el campo..."
                      className="rounded-lg bg-gray-700 border border-gray-600 text-white px-2.5 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={e => updateField(i, { required: e.target.checked })}
                      className="accent-orange-500"
                    />
                    Requerido
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-4 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/post-types')}
          className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 text-sm hover:bg-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear tipo'}
        </button>
      </div>
    </form>
  )
}
