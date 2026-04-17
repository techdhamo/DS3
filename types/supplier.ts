// Supplier/Dropshipping Types

export interface SupplierProduct {
  id: string
  sku: string
  name: string
  description: string
  price: number
  stockQuantity: number
  category: string
  images: string[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  isActive: boolean
  lastSyncedAt: Date
}

export interface DropshipOrderRequest {
  orderId: string
  items: {
    productSku: string
    quantity: number
    price: number
  }[]
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
    email: string
  }
  customerNotes?: string
}

export interface DropshipOrderResponse {
  success: boolean
  supplierOrderId?: string
  trackingNumber?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'failed'
  estimatedDelivery?: Date
  error?: string
}

export interface OrderStatusResponse {
  orderId: string
  supplierOrderId: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  trackingUrl?: string
  lastUpdated: Date
  estimatedDelivery?: Date
}

export interface InventorySyncResult {
  supplier: string
  syncedAt: Date
  productsAdded: number
  productsUpdated: number
  productsRemoved: number
  errors: string[]
  success: boolean
}

export interface SupplierConfig {
  id: string
  name: string
  apiKey: string
  apiSecret?: string
  apiUrl: string
  isActive: boolean
  syncInterval: number // in minutes
  lastSyncAt?: Date
}

export interface SupplierInventoryClient {
  getProducts(): Promise<SupplierProduct[]>
  getProduct(sku: string): Promise<SupplierProduct | null>
  checkStock(sku: string): Promise<number>
}

export interface SupplierOrderClient {
  placeOrder(order: DropshipOrderRequest): Promise<DropshipOrderResponse>
  getOrderStatus(orderId: string): Promise<OrderStatusResponse>
  cancelOrder(orderId: string): Promise<boolean>
}
