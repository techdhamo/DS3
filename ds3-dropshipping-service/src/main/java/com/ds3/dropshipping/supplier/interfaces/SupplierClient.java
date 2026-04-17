package com.ds3.dropshipping.supplier.interfaces;

/**
 * Main Supplier Client Interface
 * 
 * This interface combines both inventory and order operations for a supplier.
 * Following SOLID principles, this provides a clean abstraction for supplier management.
 * 
 * This is the main interface that our business logic will depend on.
 */
public interface SupplierClient extends SupplierInventoryClient, SupplierOrderClient {
    // This interface extends both inventory and order clients
    // No additional methods needed - inherits all from parent interfaces
}
