package com.ds3.dropshipping.supplier.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Dropship Order Response Model
 * 
 * Contains the response from a supplier after placing a dropship order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DropshipOrderResponse {
    
    private Boolean success;
    
    private String supplierOrderId;
    
    private String trackingNumber;
    
    private LocalDateTime estimatedDelivery;
    
    private BigDecimal totalAmount;
    
    private BigDecimal shippingCost;
    
    private List<String> errors;
    
    private String status;
    
    /**
     * Check if order was successful
     * 
     * @return true if successful
     */
    public boolean isSuccessful() {
        return success != null && success;
    }
    
    /**
     * Check if there are any errors
     * 
     * @return true if errors exist
     */
    public boolean hasErrors() {
        return errors != null && !errors.isEmpty();
    }
    
    /**
     * Get error summary
     * 
     * @return error summary string
     */
    public String getErrorSummary() {
        if (!hasErrors()) {
            return "No errors";
        }
        
        return String.format("%d error(s): %s", 
            errors.size(), 
            errors.size() > 0 ? errors.get(0) : "");
    }
    
    /**
     * Get total cost including shipping
     * 
     * @return total cost
     */
    public BigDecimal getTotalCost() {
        if (totalAmount == null) {
            return BigDecimal.ZERO;
        }
        
        if (shippingCost == null) {
            return totalAmount;
        }
        
        return totalAmount.add(shippingCost);
    }
}
