package com.ds3.identity.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "master_accounts", indexes = {
    @Index(name = "idx_master_email", columnList = "email"),
    @Index(name = "idx_master_tenant", columnList = "tenant_id"),
    @Index(name = "idx_master_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "tenant_id", nullable = false)
    @Builder.Default
    private UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000000");
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;
    
    private String phone;
    
    @Column(name = "display_name")
    private String displayName;
    
    @Column(nullable = false)
    @Builder.Default
    private String tier = "free";
    
    @Column(nullable = false)
    @Builder.Default
    private String status = "active";
    
    @Column(name = "marketing_consent")
    @Builder.Default
    private Boolean marketingConsent = false;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @OneToMany(mappedBy = "masterAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Profile> profiles = new ArrayList<>();
    
    // Helper methods
    public boolean isActive() {
        return "active".equals(status) && deletedAt == null;
    }
    
    public Profile getPrimaryProfile() {
        return profiles.stream()
            .filter(Profile::getIsPrimary)
            .findFirst()
            .orElse(null);
    }
}
