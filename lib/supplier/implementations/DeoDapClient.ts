/**
 * DeoDap Supplier Implementation
 * 
 * Concrete implementation of SupplierClient for DeoDap wholesale supplier.
 * This class demonstrates how to implement the supplier interfaces while
 * following SOLID principles.
 * 
 * Single Responsibility: Handles only DeoDap-specific logic
 * Open/Closed: Open for extension, closed for modification
 * Liskov Substitution: Can be substituted with any SupplierClient
 * Interface Segregation: Implements only required interfaces
 * Dependency Inversion: Depends on abstractions, not concretions
 */

import { 
  SupplierClient, 
  SupplierConfig,
  SupplierInventoryClient,
  SupplierOrderClient,
  SupplierProduct,
  InventorySyncResult,
  OrderItem,
  ShippingAddress,
  DropshipOrderRequest,
  DropshipOrderResponse,
  OrderStatusResponse
} from '../interfaces/index';

export class DeoDapClient implements SupplierClient {
  private config: SupplierConfig;
  private baseUrl: string = 'https://api.deodap.com/v1';
  private isInitialized: boolean = false;

  constructor(config: SupplierConfig) {
    this.config = config;
  }

  // ===================
  // CONFIGURATION METHODS
  // ===================

  getConfig(): SupplierConfig {
    return this.config;
  }

  initialize(config: SupplierConfig): void {
    this.config = config;
    this.isInitialized = true;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          apiSecret: this.config.apiSecret,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('DeoDap credential validation failed:', error);
      return false;
    }
  }

  // ===================
  // INVENTORY METHODS
  // ===================

  async fetchAllProducts(): Promise<SupplierProduct[]> {
    if (!this.isInitialized) {
      throw new Error('DeoDap client not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform DeoDap product format to our standard format
      return data.products.map(this.transformDeoDapProduct);
    } catch (error) {
      console.error('Failed to fetch DeoDap products:', error);
      throw error;
    }
  }

  async fetchProductBySku(sku: string): Promise<SupplierProduct | null> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${sku}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformDeoDapProduct(data.product);
    } catch (error) {
      console.error(`Failed to fetch DeoDap product ${sku}:`, error);
      return null;
    }
  }

  async checkStockAvailability(sku: string, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${sku}/stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error(`Failed to check stock for ${sku}:`, error);
      return false;
    }
  }

  async syncInventory(): Promise<InventorySyncResult> {
    const startTime = new Date();
    const result: InventorySyncResult = {
      success: false,
      productsSynced: 0,
      productsUpdated: 0,
      productsAdded: 0,
      errors: [],
      lastSyncAt: startTime,
    };

    try {
      const products = await this.fetchAllProducts();
      result.productsSynced = products.length;

      // Here you would typically sync with your database
      // For now, we'll just count the products
      result.productsAdded = products.length;
      
      result.success = true;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('DeoDap connection test failed:', error);
      return false;
    }
  }

  // ===================
  // ORDER METHODS
  // ===================

  async placeOrder(orderRequest: DropshipOrderRequest): Promise<DropshipOrderResponse> {
    try {
      const deoDapOrderRequest = this.transformOrderRequest(orderRequest);

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deoDapOrderRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to place order: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        supplierOrderId: data.orderId,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined,
        totalAmount: data.totalAmount,
        shippingCost: data.shippingCost,
        errors: [],
      };
    } catch (error) {
      console.error('Failed to place DeoDap order:', error);
      return {
        success: false,
        totalAmount: 0,
        shippingCost: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async getOrderStatus(supplierOrderId: string): Promise<OrderStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${supplierOrderId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get order status: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        supplierOrderId,
        status: data.status,
        trackingNumber: data.trackingNumber,
        shippedAt: data.shippedAt ? new Date(data.shippedAt) : undefined,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
        notes: data.notes,
      };
    } catch (error) {
      console.error(`Failed to get status for order ${supplierOrderId}:`, error);
      throw error;
    }
  }

  async cancelOrder(supplierOrderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${supplierOrderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to cancel order ${supplierOrderId}:`, error);
      return false;
    }
  }

  async getTrackingInfo(supplierOrderId: string): Promise<string | null> {
    try {
      const status = await this.getOrderStatus(supplierOrderId);
      return status.trackingNumber || null;
    } catch (error) {
      console.error(`Failed to get tracking info for order ${supplierOrderId}:`, error);
      return null;
    }
  }

  async testOrder(): Promise<boolean> {
    try {
      const testOrder: DropshipOrderRequest = {
        items: [
          {
            supplierSku: '5119', // The hair accessory kit
            quantity: 1,
            unitPrice: 25.00,
          },
        ],
        shippingAddress: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+919876543210',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '600001',
          country: 'India',
        },
        customerNotes: 'Test order - do not ship',
      };

      const response = await this.placeOrder(testOrder);
      return response.success;
    } catch (error) {
      console.error('Test order failed:', error);
      return false;
    }
  }

  // ===================
  // PRIVATE HELPER METHODS
  // ===================

  private transformDeoDapProduct(deoDapProduct: any): SupplierProduct {
    return {
      supplierSku: deoDapProduct.sku || deoDapProduct.code,
      name: deoDapProduct.name,
      description: deoDapProduct.description,
      category: deoDapProduct.category,
      wholesalePrice: parseFloat(deoDapProduct.wholesalePrice || deoDapProduct.price),
      retailPrice: parseFloat(deoDapProduct.retailPrice || deoDapProduct.mrp),
      stockQuantity: parseInt(deoDapProduct.stock || deoDapProduct.quantity),
      minOrderQty: parseInt(deoDapProduct.minOrderQty || deoDapProduct.moq || 1),
      weight: deoDapProduct.weight ? parseFloat(deoDapProduct.weight) : undefined,
      dimensions: deoDapProduct.dimensions ? JSON.stringify(deoDapProduct.dimensions) : undefined,
      imageUrl: deoDapProduct.imageUrl || deoDapProduct.image,
      isActive: deoDapProduct.active !== false,
    };
  }

  private transformOrderRequest(orderRequest: DropshipOrderRequest): any {
    return {
      items: orderRequest.items.map((item: OrderItem) => ({
        sku: item.supplierSku,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      shippingAddress: {
        name: orderRequest.shippingAddress.name,
        email: orderRequest.shippingAddress.email,
        phone: orderRequest.shippingAddress.phone,
        address: {
          line1: orderRequest.shippingAddress.address1,
          line2: orderRequest.shippingAddress.address2,
          city: orderRequest.shippingAddress.city,
          state: orderRequest.shippingAddress.state,
          postalCode: orderRequest.shippingAddress.postalCode,
          country: orderRequest.shippingAddress.country,
        },
      },
      notes: orderRequest.customerNotes,
      dropship: true, // Explicitly mark as dropship order
    };
  }
}
