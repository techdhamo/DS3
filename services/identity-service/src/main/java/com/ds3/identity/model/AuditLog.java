package com.ds3.identity.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;
    
    @Column(name = "actor_id", nullable = false)
    private UUID actorId;
    
    @Column(name = "actor_type", nullable = false)
    private String actorType; // master_account, system, service
    
    @Column(name = "action", nullable = false)
    private String action; // create, update, delete, read, export, etc.
    
    @Column(name = "resource_type", nullable = false)
    private String resourceType; // profile, photo, attribute, etc.
    
    @Column(name = "resource_id")
    private UUID resourceId;
    
    @Column(name = "target_id")
    private UUID targetId; // For delegated actions
    
    @Column(name = "details", columnDefinition = "jsonb")
    private String details;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "status", nullable = false)
    private String status; // success, failure
    
    @Column(name = "error_message")
    private String errorMessage;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
