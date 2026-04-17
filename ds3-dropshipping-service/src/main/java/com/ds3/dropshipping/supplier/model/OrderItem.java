package com.ds3.dropshipping.supplier.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * Order Item Model
 * 
 * Represents a single item within a dropship order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    
    private String supplierSku;
    
    private Integer quantity;
    
    @JsonProperty("unitPrice")
    private BigDecimal unitPrice;
    
    /**
     * Calculate total price for this item
     * 
     * @return total price
     */
    public BigDecimal getTotalPrice() {
        if (quantity == null || unitPrice == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(new BigDecimal(quantity));
    }
    
    /**
     * Check if item is valid
     * 
     * @return true if item has valid data
     */
    public boolean isValid() {
        return supplierSku != null && !supplierSku.trim().isEmpty() &&
               quantity != null && quantity > 0 &&
               unitPrice != null && unitPrice.compareTo(BigDecimal.ZERO) > 0;
    }
}
