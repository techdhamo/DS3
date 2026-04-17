package com.ds3.dropshipping.supplier.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Inventory Sync Result Model
 * 
 * Contains the results of an inventory synchronization operation
 * with a supplier.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventorySyncResult {
    
    private Boolean success;
    
    private Integer productsSynced;
    
    private Integer productsUpdated;
    
    private Integer productsAdded;
    
    private List<String> errors;
    
    private LocalDateTime lastSyncAt;
    
    private String supplierId;
    
    private String supplierName;
    
    /**
     * Check if sync was successful
     * 
     * @return true if successful
     */
    public boolean isSuccessful() {
        return success != null && success;
    }
    
    /**
     * Get total number of changes made
     * 
     * @return total changes
     */
    public int getTotalChanges() {
        int total = 0;
        if (productsUpdated != null) total += productsUpdated;
        if (productsAdded != null) total += productsAdded;
        return total;
    }
    
    /**
     * Check if there were any errors
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
}
