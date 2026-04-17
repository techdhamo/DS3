package com.ds3.dropshipping.supplier.interfaces;

import com.ds3.dropshipping.supplier.model.DropshipOrderResponse;
import com.ds3.dropshipping.supplier.model.DropshipOrderRequest;
import com.ds3.dropshipping.supplier.model.OrderStatusResponse;

import java.util.concurrent.CompletableFuture;

/**
 * Supplier Order Client Interface
 * 
 * This interface defines the contract for order management with suppliers.
 * Following SOLID principles, this allows us to add new suppliers without
 * modifying existing core business logic.
 * 
 * Interface Segregation Principle: Only includes order-related operations
 * Dependency Inversion Principle: High-level modules depend on this abstraction
 */
public interface SupplierOrderClient {

    /**
     * Place a dropship order with the supplier
     * 
     * @param orderRequest The order request details
     * @return CompletableFuture containing order response
     */
    CompletableFuture<DropshipOrderResponse> placeOrder(DropshipOrderRequest orderRequest);

    /**
     * Get order status from supplier
     * 
     * @param supplierOrderId The supplier's order ID
     * @return CompletableFuture containing order status
     */
    CompletableFuture<OrderStatusResponse> getOrderStatus(String supplierOrderId);

    /**
     * Cancel an order (if supported by supplier)
     * 
     * @param supplierOrderId The supplier's order ID
     * @return CompletableFuture containing true if cancellation successful
     */
    CompletableFuture<Boolean> cancelOrder(String supplierOrderId);

    /**
     * Get tracking information
     * 
     * @param supplierOrderId The supplier's order ID
     * @return CompletableFuture containing tracking number or null
     */
    CompletableFuture<String> getTrackingInfo(String supplierOrderId);

    /**
     * Test order placement (sandbox mode)
     * 
     * @return CompletableFuture containing true if test order successful
     */
    CompletableFuture<Boolean> testOrder();
}
