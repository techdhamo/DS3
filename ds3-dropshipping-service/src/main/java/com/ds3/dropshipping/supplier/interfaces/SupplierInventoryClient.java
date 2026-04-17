package com.ds3.dropshipping.supplier.interfaces;

import com.ds3.dropshipping.supplier.model.SupplierProduct;
import com.ds3.dropshipping.supplier.model.InventorySyncResult;
import com.ds3.dropshipping.supplier.model.SupplierConfig;

import java.util.List;
import java.util.concurrent.CompletableFuture;

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
public interface SupplierInventoryClient {

    /**
     * Fetch all products from the supplier
     * 
     * @return CompletableFuture containing list of supplier products
     */
    CompletableFuture<List<SupplierProduct>> fetchAllProducts();

    /**
     * Fetch a specific product by SKU
     * 
     * @param sku The supplier SKU
     * @return CompletableFuture containing the product or null if not found
     */
    CompletableFuture<SupplierProduct> fetchProductBySku(String sku);

    /**
     * Check stock availability for a product
     * 
     * @param sku The supplier SKU
     * @param quantity The required quantity
     * @return CompletableFuture containing true if available, false otherwise
     */
    CompletableFuture<Boolean> checkStockAvailability(String sku, int quantity);

    /**
     * Sync inventory with our local database
     * 
     * @return CompletableFuture containing sync result
     */
    CompletableFuture<InventorySyncResult> syncInventory();

    /**
     * Test connection to supplier API
     * 
     * @return CompletableFuture containing true if connection successful
     */
    CompletableFuture<Boolean> testConnection();

    /**
     * Get supplier configuration
     * 
     * @return SupplierConfig object
     */
    SupplierConfig getConfig();

    /**
     * Initialize the client with configuration
     * 
     * @param config Supplier configuration
     */
    void initialize(SupplierConfig config);

    /**
     * Validate API credentials
     * 
     * @return CompletableFuture containing true if credentials are valid
     */
    CompletableFuture<Boolean> validateCredentials();
}
