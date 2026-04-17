/**
 * Main Supplier Client Interface
 * 
 * This interface combines both inventory and order operations for a supplier.
 * Following SOLID principles, this provides a clean abstraction for supplier management.
 * 
 * This is the main interface that our business logic will depend on.
 */

import { SupplierInventoryClient } from './SupplierInventoryClient';
import { SupplierOrderClient } from './SupplierOrderClient';

export interface SupplierConfig {
  id: string;
  name: string;
  type: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  isActive: boolean;
}

export interface SupplierClient extends SupplierInventoryClient, SupplierOrderClient {
  /**
   * Get supplier configuration
   */
  getConfig(): SupplierConfig;
  
  /**
   * Initialize the client with configuration
   */
  initialize(config: SupplierConfig): void;
  
  /**
   * Validate API credentials
   */
  validateCredentials(): Promise<boolean>;
}
