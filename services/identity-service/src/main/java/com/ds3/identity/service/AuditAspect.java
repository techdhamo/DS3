package com.ds3.identity.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {
    
    private final AuditLogService auditLogService;
    
    @Around("@annotation(Auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getCurrentRequest();
        Auditable auditable = getAuditableAnnotation(joinPoint);
        
        String action = auditable.action();
        String resourceType = auditable.resourceType();
        
        // Extract resource ID from method parameters if available
        UUID resourceId = extractResourceId(joinPoint.getArgs());
        
        // Extract tenant/account ID from security context
        UUID actorId = extractActorId(joinPoint.getArgs());
        UUID tenantId = extractTenantId(joinPoint.getArgs());
        
        boolean success = false;
        String errorMessage = null;
        
        try {
            Object result = joinPoint.proceed();
            success = true;
            return result;
        } catch (Exception e) {
            success = false;
            errorMessage = e.getMessage();
            throw e;
        } finally {
            // Log audit event asynchronously
            try {
                auditLogService.log(
                    tenantId != null ? tenantId : UUID.randomUUID(), // Fallback if not provided
                    actorId != null ? actorId : UUID.randomUUID(), // Fallback if not provided
                    "master_account", // Default actor type
                    action,
                    resourceType,
                    resourceId,
                    null, // target ID
                    null, // details
                    request,
                    success,
                    errorMessage
                );
            } catch (Exception e) {
                log.error("Failed to log audit event", e);
            }
        }
    }
    
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
    
    private Auditable getAuditableAnnotation(ProceedingJoinPoint joinPoint) {
        try {
            return joinPoint.getSignature().getDeclaringType()
                .getMethod(joinPoint.getSignature().getName())
                .getAnnotation(Auditable.class);
        } catch (NoSuchMethodException e) {
            return null;
        }
    }
    
    private UUID extractResourceId(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof UUID) {
                return (UUID) arg;
            }
        }
        return null;
    }
    
    private UUID extractActorId(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof UUID) {
                return (UUID) arg;
            }
        }
        return null;
    }
    
    private UUID extractTenantId(Object[] args) {
        // In a real implementation, this would come from the security context
        // For now, return the first UUID as a fallback
        for (Object arg : args) {
            if (arg instanceof UUID) {
                return (UUID) arg;
            }
        }
        return null;
    }
}
