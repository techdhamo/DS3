package com.ds3.dropshipping.supplier.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Supplier Product Model
 * 
 * Represents a product from a supplier with all relevant details
 * for dropshipping operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierProduct {
    
    private String supplierSku;
    
    private String name;
    
    private String description;
    
    private String category;
    
    @JsonProperty("wholesalePrice")
    private BigDecimal wholesalePrice;
    
    @JsonProperty("retailPrice")
    private BigDecimal retailPrice;
    
    @JsonProperty("stockQuantity")
    private Integer stockQuantity;
    
    @JsonProperty("minOrderQty")
    private Integer minOrderQty;
    
    private Double weight; // in grams
    
    private String dimensions; // JSON string for LxWxH
    
    @JsonProperty("imageUrl")
    private String imageUrl;
    
    @JsonProperty("isActive")
    private Boolean active;
    
    @JsonProperty("lastSyncAt")
    private LocalDateTime lastSyncAt;
    
    /**
     * Check if product is available for ordering
     * 
     * @return true if product is active and has stock
     */
    public boolean isAvailable() {
        return active != null && active && 
               stockQuantity != null && stockQuantity > 0;
    }
    
    /**
     * Check if requested quantity can be fulfilled
     * 
     * @param requestedQuantity The quantity to check
     * @return true if quantity is available
     */
    public boolean canFulfillQuantity(int requestedQuantity) {
        return isAvailable() && 
               stockQuantity >= requestedQuantity &&
               (minOrderQty == null || requestedQuantity >= minOrderQty);
    }
    
    /**
     * Calculate profit margin
     * 
     * @return profit margin as percentage
     */
    public BigDecimal getProfitMargin() {
        if (wholesalePrice == null || retailPrice == null || 
            wholesalePrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal profit = retailPrice.subtract(wholesalePrice);
        return profit.divide(wholesalePrice, 4, RoundingMode.HALF_UP)
                      .multiply(new BigDecimal("100"));
    }
}
