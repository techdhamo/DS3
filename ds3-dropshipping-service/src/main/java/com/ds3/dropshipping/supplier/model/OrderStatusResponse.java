package com.ds3.dropshipping.supplier.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Order Status Response Model
 * 
 * Contains the status information for an order from a supplier.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusResponse {
    
    private String supplierOrderId;
    
    private String status;
    
    private String trackingNumber;
    
    private LocalDateTime shippedAt;
    
    private LocalDateTime deliveredAt;
    
    private String notes;
    
    private LocalDateTime lastUpdated;
    
    /**
     * Check if order is shipped
     * 
     * @return true if shipped
     */
    public boolean isShipped() {
        return shippedAt != null;
    }
    
    /**
     * Check if order is delivered
     * 
     * @return true if delivered
     */
    public boolean isDelivered() {
        return deliveredAt != null;
    }
    
    /**
     * Check if order is in transit
     * 
     * @return true if in transit
     */
    public boolean isInTransit() {
        return isShipped() && !isDelivered();
    }
    
    /**
     * Get status display text
     * 
     * @return human-readable status
     */
    public String getStatusDisplay() {
        if (status == null) {
            return "Unknown";
        }
        
        switch (status.toLowerCase()) {
            case "pending":
                return "Order Pending";
            case "processing":
                return "Processing";
            case "shipped":
                return "Shipped";
            case "delivered":
                return "Delivered";
            case "cancelled":
                return "Cancelled";
            case "returned":
                return "Returned";
            default:
                return status;
        }
    }
}
