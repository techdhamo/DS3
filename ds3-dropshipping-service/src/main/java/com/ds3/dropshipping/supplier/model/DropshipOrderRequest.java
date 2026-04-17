package com.ds3.dropshipping.supplier.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Dropship Order Request Model
 * 
 * Represents an order request to be placed with a supplier
 * for dropshipping fulfillment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DropshipOrderRequest {
    
    private List<OrderItem> items;
    
    private ShippingAddress shippingAddress;
    
    private String customerNotes;
    
    /**
     * Calculate total order amount
     * 
     * @return total amount
     */
    public BigDecimal getTotalAmount() {
        if (items == null) {
            return BigDecimal.ZERO;
        }
        
        return items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Get total quantity of items
     * 
     * @return total quantity
     */
    public Integer getTotalQuantity() {
        if (items == null) {
            return 0;
        }
        
        return items.stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();
    }
    
    /**
     * Check if order request is valid
     * 
     * @return true if valid
     */
    public boolean isValid() {
        return items != null && !items.isEmpty() &&
               shippingAddress != null && shippingAddress.isValid() &&
               items.stream().allMatch(OrderItem::isValid);
    }
}
