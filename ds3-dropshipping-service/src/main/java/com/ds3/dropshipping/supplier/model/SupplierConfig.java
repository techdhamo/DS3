package com.ds3.dropshipping.supplier.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Supplier Configuration Model
 * 
 * Contains configuration details for connecting to a supplier's API
 * and managing the integration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierConfig {
    
    private String id;
    
    private String name;
    
    private String type;
    
    private String apiKey;
    
    private String apiSecret;
    
    private String webhookUrl;
    
    private Boolean active;
    
    private String baseUrl;
    
    private Integer timeoutSeconds;
    
    private Integer retryAttempts;
    
    /**
     * Validate required configuration
     * 
     * @return true if configuration is valid
     */
    public boolean isValid() {
        return id != null && !id.trim().isEmpty() &&
               name != null && !name.trim().isEmpty() &&
               type != null && !type.trim().isEmpty() &&
               apiKey != null && !apiKey.trim().isEmpty();
    }
    
    /**
     * Get timeout in milliseconds
     * 
     * @return timeout in milliseconds
     */
    public Integer getTimeoutMillis() {
        return timeoutSeconds != null ? timeoutSeconds * 1000 : 30000; // Default 30 seconds
    }
    
    /**
     * Get retry attempts
     * 
     * @return number of retry attempts
     */
    public Integer getRetryAttempts() {
        return retryAttempts != null ? retryAttempts : 3; // Default 3 attempts
    }
}
