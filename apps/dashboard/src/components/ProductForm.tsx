'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera } from 'lucide-react'

type Category = { id: string; name: string }

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  discountPrice: string | null
  isFeatured: boolean
  categoryId: string | null
  imageUrls: string[]
}

const NO_CATEGORY = '__none__'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrls[0] ?? null)
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? NO_CATEGORY)
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
    formData.set('categoryId', categoryId === NO_CATEGORY ? '' : categoryId)

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)

      if (result.success) {
        router.push('/dashboard/products')
      } else {
        setError(result.error ?? 'Error desconocido')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Imagen */}
      <div
        className="relative flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
        onClick={() => imageInputRef.current?.click()}
      >
        {imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Camera className="h-8 w-8" />
            <span className="text-sm">Tocá para agregar foto</span>
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Ej: Medialunas de manteca"
        />
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description ?? ''}
          placeholder="Descripción breve del producto..."
          className="resize-none"
        />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Precio *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={product ? String(product.price) : ''}
              placeholder="0.00"
              className="pl-7"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discountPrice">Precio oferta</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              id="discountPrice"
              name="discountPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.discountPrice ?? ''}
              placeholder="0.00"
              className="pl-7"
            />
          </div>
        </div>
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-1.5">
        <Label>Categoría</Label>
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-3 py-2.5 text-xs text-muted-foreground">
            No hay categorías creadas.{' '}
            <a href="/dashboard/categories" className="text-primary underline underline-offset-2">
              Crear categorías →
            </a>
          </p>
        ) : (
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Sin categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CATEGORY}>Sin categoría</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Destacado */}
      <button
        type="button"
        onClick={() => setIsFeatured(!isFeatured)}
        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
          isFeatured ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}
      >
        <span className="text-2xl">{isFeatured ? '⭐' : '☆'}</span>
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
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/dashboard/products')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
