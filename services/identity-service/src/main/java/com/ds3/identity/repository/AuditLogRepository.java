package com.ds3.identity.repository;

import com.ds3.identity.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    
    List<AuditLog> findByActorIdAndTenantIdOrderByCreatedAtDesc(UUID actorId, UUID tenantId);
    
    List<AuditLog> findByResourceIdAndTenantIdOrderByCreatedAtDesc(UUID resourceId, UUID tenantId);
    
    @Query("SELECT al FROM AuditLog al WHERE al.tenantId = :tenantId AND al.createdAt >= :since ORDER BY al.createdAt DESC")
    List<AuditLog> findByTenantIdSince(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);
    
    @Query("SELECT al FROM AuditLog al WHERE al.tenantId = :tenantId AND al.resourceType = :resourceType AND al.createdAt >= :since ORDER BY al.createdAt DESC")
    List<AuditLog> findByTenantIdAndResourceTypeSince(
        @Param("tenantId") UUID tenantId,
        @Param("resourceType") String resourceType,
        @Param("since") LocalDateTime since
    );
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.tenantId = :tenantId AND al.createdAt >= :since")
    long countByTenantIdSince(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);
    
    @Query("SELECT al FROM AuditLog al WHERE al.tenantId = :tenantId AND al.action = :action AND al.createdAt >= :since ORDER BY al.createdAt DESC")
    List<AuditLog> findByTenantIdAndActionSince(
        @Param("tenantId") UUID tenantId,
        @Param("action") String action,
        @Param("since") LocalDateTime since
    );
}
