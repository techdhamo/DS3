/**
 * Supplier Service
 * 
 * Core business logic for supplier management.
 * This service depends on abstractions (interfaces) rather than concrete implementations,
 * following the Dependency Inversion Principle.
 * 
 * This service orchestrates supplier operations and provides a clean API
 * for the rest of the application to interact with suppliers.
 */

import { SupplierClient, SupplierConfig } from '../interfaces';
import { DeoDapClient } from '../implementations/DeoDapClient';
import { PrismaClient } from '@prisma/client';

export interface SupplierSyncResult {
  supplierId: string;
  supplierName: string;
  success: boolean;
  productsSynced: number;
  errors: string[];
  syncedAt: Date;
}

export interface DropshipOrderResult {
  success: boolean;
  dropshipOrderId?: string;
  supplierOrderId?: string;
  trackingNumber?: string;
  totalAmount: number;
  shippingCost: number;
  errors: string[];
}

export class SupplierService {
  private prisma: PrismaClient;
  private supplierClients: Map<string, SupplierClient> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Initialize all active suppliers from the database
   */
  async initializeSuppliers(): Promise<void> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { isActive: true },
    });

    for (const supplier of suppliers) {
      await this.initializeSupplier(supplier);
    }
  }

  /**
   * Initialize a specific supplier
   */
  async initializeSupplier(supplier: any): Promise<void> {
    const config: SupplierConfig = {
      id: supplier.id,
      name: supplier.name,
      type: supplier.type,
      apiKey: supplier.apiKey,
      apiSecret: supplier.apiSecret,
      webhookUrl: supplier.webhookUrl,
      isActive: supplier.isActive,
    };

    const client = this.createSupplierClient(config);
    await client.initialize(config);
    
    this.supplierClients.set(supplier.id, client);
  }

  /**
   * Factory method to create supplier clients based on type
   * Following Open/Closed Principle: easy to extend with new suppliers
   */
  private createSupplierClient(config: SupplierConfig): SupplierClient {
    switch (config.type) {
      case 'DEODAP':
        return new DeoDapClient(config);
      // Add more suppliers here as needed
      // case 'INDIAMART':
      //   return new IndiaMartClient(config);
      // case 'UDAAN':
      //   return new UdaanClient(config);
      default:
        throw new Error(`Unsupported supplier type: ${config.type}`);
    }
  }

  /**
   * Sync inventory for all active suppliers
   */
  async syncAllInventory(): Promise<SupplierSyncResult[]> {
    const results: SupplierSyncResult[] = [];

    for (const [supplierId, client] of this.supplierClients) {
      try {
        const syncResult = await client.syncInventory();
        
        // Update local database with synced products
        await this.updateLocalProducts(supplierId, await client.fetchAllProducts());

        results.push({
          supplierId,
          supplierName: client.getConfig().name,
          success: syncResult.success,
          productsSynced: syncResult.productsSynced,
          errors: syncResult.errors,
          syncedAt: syncResult.lastSyncAt,
        });
      } catch (error) {
        results.push({
          supplierId,
          supplierName: client.getConfig().name,
          success: false,
          productsSynced: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          syncedAt: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Sync inventory for a specific supplier
   */
  async syncSupplierInventory(supplierId: string): Promise<SupplierSyncResult> {
    const client = this.supplierClients.get(supplierId);
    
    if (!client) {
      throw new Error(`Supplier client not found: ${supplierId}`);
    }

    try {
      const syncResult = await client.syncInventory();
      
      // Update local database
      await this.updateLocalProducts(supplierId, await client.fetchAllProducts());

      return {
        supplierId,
        supplierName: client.getConfig().name,
        success: syncResult.success,
        productsSynced: syncResult.productsSynced,
        errors: syncResult.errors,
        syncedAt: syncResult.lastSyncAt,
      };
    } catch (error) {
      return {
        supplierId,
        supplierName: client.getConfig().name,
        success: false,
        productsSynced: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        syncedAt: new Date(),
      };
    }
  }

  /**
   * Place a dropship order with the best available supplier
   */
  async placeDropshipOrder(
    orderData: {
      items: Array<{ supplierSku: string; quantity: number }>;
      shippingAddress: any;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      notes?: string;
    }
  ): Promise<DropshipOrderResult> {
    // Find the best supplier for these items
    const supplierId = await this.findBestSupplier(orderData.items);
    
    if (!supplierId) {
      return {
        success: false,
        totalAmount: 0,
        shippingCost: 0,
        errors: ['No suitable supplier found for the requested items'],
      };
    }

    const client = this.supplierClients.get(supplierId);
    if (!client) {
      return {
        success: false,
        totalAmount: 0,
        shippingCost: 0,
        errors: ['Supplier client not available'],
      };
    }

    try {
      // Get current product pricing
      const products = await this.getSupplierProducts(supplierId, orderData.items);
      
      const orderRequest = {
        items: orderData.items.map(item => {
          const product = products.find(p => p.supplierSku === item.supplierSku);
          return {
            supplierSku: item.supplierSku,
            quantity: item.quantity,
            unitPrice: product?.retailPrice || 0,
          };
        }),
        shippingAddress: orderData.shippingAddress,
        customerNotes: orderData.notes,
      };

      const orderResponse = await client.placeOrder(orderRequest);

      if (orderResponse.success) {
        // Create dropship order record in our database
        const dropshipOrder = await this.prisma.dropshipOrder.create({
          data: {
            orderId: 'TEMP_ORDER_ID', // This would come from the main order
            supplierId,
            supplierOrderId: orderResponse.supplierOrderId,
            supplierStatus: 'PENDING',
            trackingNumber: orderResponse.trackingNumber,
            totalAmount: orderResponse.totalAmount,
            shippingCost: orderResponse.shippingCost,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            shippingAddress: orderData.shippingAddress,
            notes: orderData.notes,
          },
        });

        // Create order items
        for (const item of orderRequest.items) {
          const supplierProduct = products.find(p => p.supplierSku === item.supplierSku);
          if (supplierProduct) {
            await this.prisma.dropshipOrderItem.create({
              data: {
                dropshipOrderId: dropshipOrder.id,
                supplierProductId: supplierProduct.id, // This would need to be mapped
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
              },
            });
          }
        }

        return {
          success: true,
          dropshipOrderId: dropshipOrder.id,
          supplierOrderId: orderResponse.supplierOrderId,
          trackingNumber: orderResponse.trackingNumber,
          totalAmount: orderResponse.totalAmount,
          shippingCost: orderResponse.shippingCost,
          errors: [],
        };
      } else {
        return {
          success: false,
          totalAmount: 0,
          shippingCost: 0,
          errors: orderResponse.errors,
        };
      }
    } catch (error) {
      return {
        success: false,
        totalAmount: 0,
        shippingCost: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get order status from supplier
   */
  async getOrderStatus(dropshipOrderId: string): Promise<any> {
    const dropshipOrder = await this.prisma.dropshipOrder.findUnique({
      where: { id: dropshipOrderId },
      include: { supplier: true },
    });

    if (!dropshipOrder || !dropshipOrder.supplierOrderId) {
      throw new Error('Dropship order not found or not yet placed with supplier');
    }

    const client = this.supplierClients.get(dropshipOrder.supplierId);
    if (!client) {
      throw new Error('Supplier client not available');
    }

    const status = await client.getOrderStatus(dropshipOrder.supplierOrderId);

    // Update our database with the latest status
    await this.prisma.dropshipOrder.update({
      where: { id: dropshipOrderId },
      data: {
        supplierStatus: status.status,
        trackingNumber: status.trackingNumber,
      },
    });

    return status;
  }

  /**
   * Get all available products from all suppliers
   */
  async getAllSupplierProducts(): Promise<any[]> {
    const allProducts: any[] = [];

    for (const [supplierId, client] of this.supplierClients) {
      try {
        const products = await client.fetchAllProducts();
        allProducts.push(...products.map(product => ({
          ...product,
          supplierId,
          supplierName: client.getConfig().name,
        })));
      } catch (error) {
        console.error(`Failed to fetch products from supplier ${supplierId}:`, error);
      }
    }

    return allProducts;
  }

  /**
   * Test all supplier connections
   */
  async testAllConnections(): Promise<{ supplierId: string; supplierName: string; connected: boolean; error?: string }[]> {
    const results: { supplierId: string; supplierName: string; connected: boolean; error?: string }[] = [];

    for (const [supplierId, client] of this.supplierClients) {
      try {
        const connected = await client.testConnection();
        results.push({
          supplierId,
          supplierName: client.getConfig().name,
          connected,
        });
      } catch (error) {
        results.push({
          supplierId,
          supplierName: client.getConfig().name,
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  // ===================
  // PRIVATE HELPER METHODS
  // ===================

  private async updateLocalProducts(supplierId: string, products: any[]): Promise<void> {
    for (const product of products) {
      await this.prisma.supplierProduct.upsert({
        where: {
          supplierId_supplierSku: {
            supplierId,
            supplierSku: product.supplierSku,
          },
        },
        update: {
          name: product.name,
          description: product.description,
          category: product.category,
          wholesalePrice: product.wholesalePrice,
          retailPrice: product.retailPrice,
          stockQuantity: product.stockQuantity,
          minOrderQty: product.minOrderQty,
          weight: product.weight,
          dimensions: product.dimensions,
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          lastSyncAt: new Date(),
        },
        create: {
          supplierId,
          supplierSku: product.supplierSku,
          name: product.name,
          description: product.description,
          category: product.category,
          wholesalePrice: product.wholesalePrice,
          retailPrice: product.retailPrice,
          stockQuantity: product.stockQuantity,
          minOrderQty: product.minOrderQty,
          weight: product.weight,
          dimensions: product.dimensions,
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          lastSyncAt: new Date(),
        },
      });
    }
  }

  private async findBestSupplier(items: Array<{ supplierSku: string; quantity: number }>): Promise<string | null> {
    // For now, return the first supplier that has all items
    // In a real implementation, you might consider:
    // - Price comparison
    // - Stock availability
    // - Shipping costs
    // - Supplier reliability

    for (const [supplierId, client] of this.supplierClients) {
      let canFulfill = true;

      for (const item of items) {
        const available = await client.checkStockAvailability(item.supplierSku, item.quantity);
        if (!available) {
          canFulfill = false;
          break;
        }
      }

      if (canFulfill) {
        return supplierId;
      }
    }

    return null;
  }

  private async getSupplierProducts(supplierId: string, items: Array<{ supplierSku: string; quantity: number }>): Promise<any[]> {
    const client = this.supplierClients.get(supplierId);
    if (!client) {
      return [];
    }

    const products: any[] = [];
    for (const item of items) {
      const product = await client.fetchProductBySku(item.supplierSku);
      if (product) {
        products.push(product);
      }
    }

    return products;
  }
}
