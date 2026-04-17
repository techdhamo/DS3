package com.ds3.dropshipping.supplier.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Shipping Address Model
 * 
 * Represents a shipping address for dropship orders.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {
    
    private String name;
    
    private String email;
    
    private String phone;
    
    @JsonProperty("address1")
    private String addressLine1;
    
    @JsonProperty("address2")
    private String addressLine2;
    
    private String city;
    
    private String state;
    
    private String postalCode;
    
    private String country;
    
    /**
     * Get full address as string
     * 
     * @return formatted address
     */
    public String getFullAddress() {
        StringBuilder address = new StringBuilder();
        
        if (addressLine1 != null) {
            address.append(addressLine1);
        }
        
        if (addressLine2 != null && !addressLine2.trim().isEmpty()) {
            address.append(", ").append(addressLine2);
        }
        
        if (city != null) {
            address.append(", ").append(city);
        }
        
        if (state != null) {
            address.append(", ").append(state);
        }
        
        if (postalCode != null) {
            address.append(" ").append(postalCode);
        }
        
        if (country != null) {
            address.append(", ").append(country);
        }
        
        return address.toString();
    }
    
    /**
     * Check if address is valid
     * 
     * @return true if address has required fields
     */
    public boolean isValid() {
        return name != null && !name.trim().isEmpty() &&
               email != null && !email.trim().isEmpty() &&
               addressLine1 != null && !addressLine1.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               country != null && !country.trim().isEmpty();
    }
    
    /**
     * Check if phone number is provided
     * 
     * @return true if phone is available
     */
    public boolean hasPhone() {
        return phone != null && !phone.trim().isEmpty();
    }
}
