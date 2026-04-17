// Global Type Definitions for DS3

// User Types
export interface User {
  id: string
  email: string
  name: string
  image?: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  rating: number
  reviews: number
  stock: number
  isDropship: boolean
  supplier?: string
  code?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

// Order Types
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentStatus: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

// Cart Types
export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter Types
export interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  rating?: number
  sortBy?: 'popularity' | 'price-low' | 'price-high' | 'rating' | 'newest'
  search?: string
  inStock?: boolean
  isDropship?: boolean
}
