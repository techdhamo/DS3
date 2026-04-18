package com.ds3.identity.service;

import com.ds3.identity.model.AuditLog;
import com.ds3.identity.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogService {
    
    private final AuditLogRepository auditLogRepository;
    
    /**
     * Log an audit event
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(UUID tenantId, UUID actorId, String actorType, String action,
                    String resourceType, UUID resourceId, UUID targetId,
                    String details, HttpServletRequest request, boolean success, String errorMessage) {
        
        AuditLog auditLog = AuditLog.builder()
            .tenantId(tenantId)
            .actorId(actorId)
            .actorType(actorType)
            .action(action)
            .resourceType(resourceType)
            .resourceId(resourceId)
            .targetId(targetId)
            .details(details)
            .ipAddress(getClientIp(request))
            .userAgent(request != null ? request.getHeader("User-Agent") : null)
            .status(success ? "success" : "failure")
            .errorMessage(errorMessage)
            .build();
        
        try {
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to persist audit log", e);
            // Don't throw - audit logging failure shouldn't break the main flow
        }
    }
    
    /**
     * Get audit logs for a tenant
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getTenantAuditLogs(UUID tenantId, LocalDateTime since) {
        return auditLogRepository.findByTenantIdSince(tenantId, since != null ? since : LocalDateTime.now().minusDays(30));
    }
    
    /**
     * Get audit logs for a specific resource
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getResourceAuditLogs(UUID tenantId, UUID resourceId) {
        return auditLogRepository.findByResourceIdAndTenantIdOrderByCreatedAtDesc(resourceId, tenantId);
    }
    
    /**
     * Get audit logs for a specific actor
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getActorAuditLogs(UUID tenantId, UUID actorId) {
        return auditLogRepository.findByActorIdAndTenantIdOrderByCreatedAtDesc(actorId, tenantId);
    }
    
    /**
     * Get audit logs for a specific action type
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByAction(UUID tenantId, String action, LocalDateTime since) {
        return auditLogRepository.findByTenantIdAndActionSince(
            tenantId, action, since != null ? since : LocalDateTime.now().minusDays(30)
        );
    }
    
    /**
     * Get audit logs for a specific resource type
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByResourceType(UUID tenantId, String resourceType, LocalDateTime since) {
        return auditLogRepository.findByTenantIdAndResourceTypeSince(
            tenantId, resourceType, since != null ? since : LocalDateTime.now().minusDays(30)
        );
    }
    
    /**
     * Get audit statistics for a tenant
     */
    @Transactional(readOnly = true)
    public AuditStatistics getAuditStatistics(UUID tenantId, LocalDateTime since) {
        long totalEvents = auditLogRepository.countByTenantIdSince(
            tenantId, since != null ? since : LocalDateTime.now().minusDays(30)
        );
        
        return AuditStatistics.builder()
            .totalEvents(totalEvents)
            .since(since != null ? since : LocalDateTime.now().minusDays(30))
            .build();
    }
    
    /**
     * Extract client IP from request
     */
    private String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        
        // Handle multiple IPs in X-Forwarded-For
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class AuditStatistics {
        private long totalEvents;
        private LocalDateTime since;
    }
}
