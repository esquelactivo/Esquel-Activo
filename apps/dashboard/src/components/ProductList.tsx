'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { deleteProduct, toggleFeatured, toggleActive } from '@/actions/products'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus } from 'lucide-react'

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
}

export function ProductList({ products }: ProductListProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    startTransition(async () => { await deleteProduct(id) })
  }

  function handleToggleFeatured(id: string, current: boolean) {
    startTransition(async () => { await toggleFeatured(id, !current) })
  }

  function handleToggleActive(id: string, current: boolean) {
    startTransition(async () => { await toggleActive(id, !current) })
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} producto{products.length !== 1 ? 's' : ''}
        </p>
        <Button asChild size="sm">
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {/* Lista */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-4xl">🛍️</span>
          <p className="font-medium text-gray-700">Todavía no hay productos</p>
          <p className="text-sm text-muted-foreground">Tocá "Nuevo producto" para agregar el primero</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-opacity ${
                !p.isActive && 'opacity-60'
              }`}
            >
              {/* Imagen */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {p.imageUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                {p.category && (
                  <p className="text-xs text-muted-foreground">{p.category.name}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {p.discountPrice ? (
                    <>
                      <span className="text-sm font-bold text-primary">
                        ${Number(p.discountPrice).toLocaleString('es-AR')}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        ${Number(p.price).toLocaleString('es-AR')}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-800">
                      ${Number(p.price).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                    disabled={isPending}
                    title={p.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    className={`h-8 w-8 ${p.isFeatured ? 'text-amber-500' : 'text-gray-400'}`}
                  >
                    ⭐
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/dashboard/products/${p.id}/edit`} title="Editar producto">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(p.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Badge
                  variant={p.isActive ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleToggleActive(p.id, p.isActive)}
                >
                  {p.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
