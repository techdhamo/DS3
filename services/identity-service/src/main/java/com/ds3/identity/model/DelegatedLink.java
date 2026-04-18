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

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "delegated_links", indexes = {
    @Index(name = "idx_delegated_delegator", columnList = "delegator_account_id"),
    @Index(name = "idx_delegated_owner", columnList = "owner_account_id"),
    @Index(name = "idx_delegated_profile", columnList = "owner_profile_id"),
    @Index(name = "idx_delegated_token", columnList = "invitation_token")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DelegatedLink {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "tenant_id", nullable = false)
    @Builder.Default
    private UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000000");
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegator_account_id", nullable = false)
    private MasterAccount delegatorAccount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_account_id", nullable = false)
    private MasterAccount ownerAccount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_profile_id", nullable = false)
    private Profile ownerProfile;
    
    @Column(name = "invitation_token", nullable = false, unique = true)
    private String invitationToken;
    
    @Column(nullable = false)
    @Builder.Default
    private String status = "pending";
    
    @Column(name = "permissions", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private DelegatedPermissions permissions = new DelegatedPermissions();
    
    @Column(name = "invitation_sent_via")
    private String invitationSentVia;
    
    @Column(name = "invitation_sent_at")
    @Builder.Default
    private LocalDateTime invitationSentAt = LocalDateTime.now();
    
    @Column(name = "invitation_expires_at")
    @Builder.Default
    private LocalDateTime invitationExpiresAt = LocalDateTime.now().plusDays(7);
    
    @Column(name = "invitation_message")
    private String invitationMessage;
    
    @Column(name = "access_count")
    @Builder.Default
    private Integer accessCount = 0;
    
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public boolean isExpired() {
        return "pending".equals(status) && LocalDateTime.now().isAfter(invitationExpiresAt);
    }
    
    public void recordAccess() {
        this.accessCount++;
        this.lastAccessedAt = LocalDateTime.now();
    }
}
