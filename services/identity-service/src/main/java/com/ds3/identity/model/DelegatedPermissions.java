package com.ds3.identity.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DelegatedPermissions {
    
    @Builder.Default
    private Boolean canViewSize = true;
    
    @Builder.Default
    private Boolean canViewStyle = true;
    
    @Builder.Default
    private Boolean canViewPreferences = true;
    
    @Builder.Default
    private Boolean canViewWeight = false;
    
    @Builder.Default
    private Boolean canViewBmi = false;
    
    @Builder.Default
    private Boolean canViewHeight = true;
    
    @Builder.Default
    private Boolean canViewAge = false;
    
    @Builder.Default
    private Boolean canViewGender = true;
    
    @Builder.Default
    private Boolean canViewPhotos = false;
    
    @Builder.Default
    private Boolean canOrderFor = true;
    
    @Builder.Default
    private Boolean canOrderWithoutApproval = false;
    
    @Builder.Default
    private Boolean canViewHistory = false;
    
    @Builder.Default
    private Boolean canEditPreferences = false;
    
    // Helper method to check specific permission (null-safe)
    public boolean hasPermission(String permissionName) {
        return switch (permissionName) {
            case "view_size" -> Boolean.TRUE.equals(canViewSize);
            case "view_style" -> Boolean.TRUE.equals(canViewStyle);
            case "view_preferences" -> Boolean.TRUE.equals(canViewPreferences);
            case "view_weight" -> Boolean.TRUE.equals(canViewWeight);
            case "view_bmi" -> Boolean.TRUE.equals(canViewBmi);
            case "view_height" -> Boolean.TRUE.equals(canViewHeight);
            case "view_age" -> Boolean.TRUE.equals(canViewAge);
            case "view_gender" -> Boolean.TRUE.equals(canViewGender);
            case "view_photos" -> Boolean.TRUE.equals(canViewPhotos);
            case "order_for" -> Boolean.TRUE.equals(canOrderFor);
            case "order_without_approval" -> Boolean.TRUE.equals(canOrderWithoutApproval);
            case "view_history" -> Boolean.TRUE.equals(canViewHistory);
            case "edit_preferences" -> Boolean.TRUE.equals(canEditPreferences);
            default -> false;
        };
    }
}
