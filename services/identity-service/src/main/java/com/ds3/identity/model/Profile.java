package com.ds3.identity.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles", indexes = {
    @Index(name = "idx_profile_master", columnList = "master_account_id"),
    @Index(name = "idx_profile_relationship", columnList = "relationship"),
    @Index(name = "idx_profile_active", columnList = "master_account_id, is_active"),
    @Index(name = "idx_profile_vector", columnList = "vector_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "tenant_id", nullable = false)
    @Builder.Default
    private UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000000");
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_account_id", nullable = false)
    private MasterAccount masterAccount;
    
    @Column(nullable = false)
    private String name;
    
    private String nickname;
    
    @Column(nullable = false)
    @Builder.Default
    private String relationship = "self";
    
    @Column(name = "age_group")
    private String ageGroup;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    private String gender;
    
    @Column(name = "avatar_url_3d")
    private String avatarUrl3d;
    
    @Column(name = "avatar_format")
    private String avatarFormat;
    
    @Column(name = "vector_id")
    private UUID vectorId;
    
    @Column(name = "vector_status")
    @Builder.Default
    private String vectorStatus = "pending";
    
    @Column(name = "privacy_settings", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private PrivacySettings privacySettings = new PrivacySettings();
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;
    
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Check if profile allows a specific permission for a viewer
    public boolean allowsPermission(String permission, boolean isOwner) {
        if (isOwner) return true;
        
        return switch (permission) {
            case "view_weight" -> privacySettings.getShowWeight();
            case "view_bmi" -> privacySettings.getShowBmi();
            case "view_height" -> privacySettings.getShowHeight();
            case "view_size" -> privacySettings.getShowSize();
            case "view_style" -> privacySettings.getShowStyle();
            case "view_photos" -> privacySettings.getShowPhotos();
            case "view_age" -> privacySettings.getShowAge();
            case "view_gender" -> privacySettings.getShowGender();
            case "order_for" -> privacySettings.getAllowDelegatedOrders();
            default -> false;
        };
    }
}
