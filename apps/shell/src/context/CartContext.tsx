'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  key: string           // `${productId}:${variantId ?? ''}`
  id: string            // productId
  variantId: string | null
  variantName: string | null
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity' | 'key'>) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY = 'ea_cart'

function migrateItem(i: any): CartItem {
  return {
    key: i.key ?? `${i.id}:${i.variantId ?? ''}`,
    id: i.id,
    variantId: i.variantId ?? null,
    variantName: i.variantName ?? null,
    name: i.name,
    price: i.price,
    imageUrl: i.imageUrl ?? null,
    quantity: i.quantity,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems((JSON.parse(stored) as any[]).map(migrateItem))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated])

  function addItem(newItem: Omit<CartItem, 'quantity' | 'key'>) {
    const key = `${newItem.id}:${newItem.variantId ?? ''}`
    setItems(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...newItem, key, quantity: 1 }]
    })
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i.key !== key))
  }

  function updateQuantity(key: string, quantity: number) {
    if (quantity <= 0) { removeItem(key); return }
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i))
  }

  function clearCart() { setItems([]) }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      total, count, isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
