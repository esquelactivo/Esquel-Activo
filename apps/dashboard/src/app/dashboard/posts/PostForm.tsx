'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, updatePost } from './actions'

type PostTypeField = {
  id: string
  name: string
  key: string
  type: string
  required: boolean
  placeholder: string | null
}

type PostType = {
  id: string
  name: string
  slug: string
  icon: string | null
  fields: PostTypeField[]
}

type Post = {
  id: string
  title: string
  isPublished: boolean
  values: { fieldKey: string; value: string | null }[]
}

interface PostFormProps {
  postType: PostType
  post?: Post
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: 'text', TEXTAREA: 'textarea', IMAGE: 'url', URL: 'url',
  DATE: 'date', NUMBER: 'number', BOOLEAN: 'checkbox',
}

export function PostForm({ postType, post }: PostFormProps) {
  const router = useRouter()
  const isEdit = !!post
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(post?.title ?? '')
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false)

  const initialValues = Object.fromEntries(
    postType.fields.map(f => [
      f.key,
      post?.values.find(v => v.fieldKey === f.key)?.value ?? '',
    ])
  )
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initialValues)

  function setFieldValue(key: string, value: string) {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('postTypeId', postType.id)
    fd.set('title', title)
    fd.set('isPublished', String(isPublished))
    fd.set('fieldValues', JSON.stringify(fieldValues))

    startTransition(async () => {
      const result = isEdit
        ? await updatePost(post.id, fd)
        : await createPost(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5 shadow-sm">

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder={`Título de la ${postType.name.toLowerCase()}...`}
            className="rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Campos dinámicos */}
        {postType.fields.map(field => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'TEXTAREA' ? (
              <textarea
                value={fieldValues[field.key] ?? ''}
                onChange={e => setFieldValue(field.key, e.target.value)}
                required={field.required}
                rows={4}
                placeholder={field.placeholder ?? ''}
                className="rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            ) : field.type === 'BOOLEAN' ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setFieldValue(field.key, fieldValues[field.key] === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${fieldValues[field.key] === 'true' ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${fieldValues[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-gray-600">{fieldValues[field.key] === 'true' ? 'Sí' : 'No'}</span>
              </label>
            ) : field.type === 'IMAGE' ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={fieldValues[field.key] ?? ''}
                  onChange={e => setFieldValue(field.key, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder ?? 'https://...'}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {fieldValues[field.key] && (
                  <img
                    src={fieldValues[field.key]}
                    alt="preview"
                    className="h-32 w-auto rounded-xl object-cover border border-gray-200"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
            ) : (
              <input
                type={FIELD_TYPE_LABELS[field.type] ?? 'text'}
                value={fieldValues[field.key] ?? ''}
                onChange={e => setFieldValue(field.key, e.target.value)}
                required={field.required}
                placeholder={field.placeholder ?? ''}
                className="rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            )}
          </div>
        ))}

        {/* Estado de publicación */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Publicar</span>
          <button
            type="button"
            onClick={() => setIsPublished(v => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isPublished ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/posts')}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear publicación'}
        </button>
      </div>
    </form>
  )
}
