package com.ds3.identity.controller;

import com.ds3.identity.service.AuditLogService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/identity/audit")
@RequiredArgsConstructor
public class AuditLogController {
    
    private final AuditLogService auditLogService;
    
    @GetMapping("/tenant")
    public ResponseEntity<AuditLogsResponse> getTenantAuditLogs(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        
        UUID tenantId = (UUID) authentication.getPrincipal();
        
        List<com.ds3.identity.model.AuditLog> logs = auditLogService.getTenantAuditLogs(tenantId, since);
        
        return ResponseEntity.ok(AuditLogsResponse.builder()
            .tenantId(tenantId)
            .logs(logs)
            .count(logs.size())
            .build());
    }
    
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<AuditLogsResponse> getResourceAuditLogs(
            @PathVariable UUID resourceId,
            Authentication authentication) {
        
        UUID tenantId = (UUID) authentication.getPrincipal();
        
        List<com.ds3.identity.model.AuditLog> logs = auditLogService.getResourceAuditLogs(tenantId, resourceId);
        
        return ResponseEntity.ok(AuditLogsResponse.builder()
            .tenantId(tenantId)
            .resourceId(resourceId)
            .logs(logs)
            .count(logs.size())
            .build());
    }
    
    @GetMapping("/actor/{actorId}")
    public ResponseEntity<AuditLogsResponse> getActorAuditLogs(
            @PathVariable UUID actorId,
            Authentication authentication) {
        
        UUID tenantId = (UUID) authentication.getPrincipal();
        
        List<com.ds3.identity.model.AuditLog> logs = auditLogService.getActorAuditLogs(tenantId, actorId);
        
        return ResponseEntity.ok(AuditLogsResponse.builder()
            .tenantId(tenantId)
            .actorId(actorId)
            .logs(logs)
            .count(logs.size())
            .build());
    }
    
    @GetMapping("/action/{action}")
    public ResponseEntity<AuditLogsResponse> getAuditLogsByAction(
            @PathVariable String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            Authentication authentication) {
        
        UUID tenantId = (UUID) authentication.getPrincipal();
        
        List<com.ds3.identity.model.AuditLog> logs = auditLogService.getAuditLogsByAction(tenantId, action, since);
        
        return ResponseEntity.ok(AuditLogsResponse.builder()
            .tenantId(tenantId)
            .action(action)
            .logs(logs)
            .count(logs.size())
            .build());
    }
    
    @GetMapping("/resource-type/{resourceType}")
    public ResponseEntity<AuditLogsResponse> getAuditLogsByResourceType(
            @PathVariable String resourceType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            Authentication authentication) {
        
        UUID tenantId = (UUID) authentication.getPrincipal();
        
        List<com.ds3.identity.model.AuditLog> logs = auditLogService.getAuditLogsByResourceType(tenantId, resourceType, since);
        
        return ResponseEntity.ok(AuditLogsResponse.builder()
            .tenantId(tenantId)
            .resourceType(resourceType)
            .logs(logs)
            .count(logs.size())
            .build());
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<AuditLogService.AuditStatistics> getAuditStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            Authentication authentication) {
        
        UUID tenantId = (UUID) authentication.getPrincipal();
        
        AuditLogService.AuditStatistics stats = auditLogService.getAuditStatistics(tenantId, since);
        
        return ResponseEntity.ok(stats);
    }
    
    @Data
    @lombok.Builder
    public static class AuditLogsResponse {
        private UUID tenantId;
        private UUID resourceId;
        private UUID actorId;
        private String action;
        private String resourceType;
        private List<com.ds3.identity.model.AuditLog> logs;
        private int count;
    }
}
