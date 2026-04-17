package com.ds3.identity.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrivacySettings {
    
    @Builder.Default
    private Boolean showWeight = false;
    
    @Builder.Default
    private Boolean showBmi = false;
    
    @Builder.Default
    private Boolean showHeight = true;
    
    @Builder.Default
    private Boolean showSize = true;
    
    @Builder.Default
    private Boolean showStyle = true;
    
    @Builder.Default
    private Boolean showPhotos = false;
    
    @Builder.Default
    private Boolean showAge = false;
    
    @Builder.Default
    private Boolean showGender = true;
    
    @Builder.Default
    private Boolean allowDelegatedOrders = true;
    
    @Builder.Default
    private Boolean requireApprovalForOrders = false;
    
    @Builder.Default
    private Boolean allowStyleSharing = true;
}
