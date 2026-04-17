"use client"

import { useState, useCallback, useEffect } from 'react'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  total: number
}

export function useCart() {
  const [cart, setCart] = useState<CartState>({ items: [], total: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ds3-cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ds3-cart', JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.productId === product.id)
      
      if (existingItem) {
        const updatedItems = prev.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      }
      
      const newItems = [...prev.items, { productId: product.id, quantity }]
      return {
        items: newItems,
        total: calculateTotal(newItems)
      }
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const updatedItems = prev.items.filter(item => item.productId !== productId)
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prev => {
      const updatedItems = prev.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }
    })
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart({ items: [], total: 0 })
  }, [])

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount
  }
}

function calculateTotal(items: CartItem[]): number {
  // This would normally fetch product prices and calculate
  // For now, return 0 as we don't have product data here
  return 0
}
