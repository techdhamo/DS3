/**
 * Supplier Inventory Client Interface
 * 
 * This interface defines the contract for inventory management with suppliers.
 * Following SOLID principles, this allows us to add new suppliers without
 * modifying existing core business logic.
 * 
 * Interface Segregation Principle: Only includes inventory-related operations
 * Dependency Inversion Principle: High-level modules depend on this abstraction
 */

export interface SupplierProduct {
  supplierSku: string;
  name: string;
  description?: string;
  category?: string;
  wholesalePrice: number;
  retailPrice: number;
  stockQuantity: number;
  minOrderQty: number;
  weight?: number; // in grams
  dimensions?: string; // JSON string for LxWxH
  imageUrl?: string;
  isActive: boolean;
}

export interface InventorySyncResult {
  success: boolean;
  productsSynced: number;
  productsUpdated: number;
  productsAdded: number;
  errors: string[];
  lastSyncAt: Date;
}

export interface SupplierInventoryClient {
  /**
   * Fetch all products from the supplier
   */
  fetchAllProducts(): Promise<SupplierProduct[]>;
  
  /**
   * Fetch a specific product by SKU
   */
  fetchProductBySku(sku: string): Promise<SupplierProduct | null>;
  
  /**
   * Check stock availability for a product
   */
  checkStockAvailability(sku: string, quantity: number): Promise<boolean>;
  
  /**
   * Sync inventory with our local database
   */
  syncInventory(): Promise<InventorySyncResult>;
  
  /**
   * Test connection to supplier API
   */
  testConnection(): Promise<boolean>;
}
