package com.ds3.identity.service;

import com.ds3.identity.model.MasterAccount;
import com.ds3.identity.model.Profile;
import com.ds3.identity.repository.MasterAccountRepository;
import com.ds3.identity.repository.ProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class GdprService {
    
    private final MasterAccountRepository masterAccountRepository;
    private final ProfileRepository profileRepository;
    private final AuditLogService auditLogService;
    private final EncryptionService encryptionService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Export all data for a master account (GDPR right to export)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> exportAccountData(UUID accountId) {
        MasterAccount account = masterAccountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        Map<String, Object> export = new HashMap<>();
        export.put("export_date", LocalDateTime.now());
        export.put("account_id", account.getId());
        export.put("account", sanitizeAccount(account));
        export.put("profiles", account.getProfiles());
        
        log.info("gdpr.export", account_id=str(accountId));
        
        return export;
    }
    
    /**
     * Delete all data for a master account (GDPR right to deletion)
     * This performs a soft delete and schedules hard deletion
     */
    @Transactional
    public void requestAccountDeletion(UUID accountId, String reason) {
        MasterAccount account = masterAccountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        // Mark for deletion
        account.setStatus("deletion_requested");
        account.setDeletedAt(LocalDateTime.now());
        
        masterAccountRepository.save(account);
        
        log.info("gdpr.deletion_requested", account_id=str(accountId), reason=reason);
        
        // Schedule hard deletion (in production, use a job queue)
        // For now, this is a placeholder
    }
    
    /**
     * Perform hard deletion of account data
     * This should be called by a scheduled job after retention period
     */
    @Transactional
    public void performHardDeletion(UUID accountId) {
        MasterAccount account = masterAccountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        // Delete all profiles
        for (Profile profile : account.getProfiles()) {
            profileRepository.delete(profile);
        }
        
        // Delete account
        masterAccountRepository.delete(account);
        
        log.info("gdpr.hard_deletion_completed", account_id=str(accountId));
    }
    
    /**
     * Export data for a specific profile
     */
    @Transactional(readOnly = true)
    public Map<String, Object> exportProfileData(UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        
        Map<String, Object> export = new HashMap<>();
        export.put("export_date", LocalDateTime.now());
        export.put("profile_id", profile.getId());
        export.put("profile", sanitizeProfile(profile));
        
        log.info("gdpr.profile_export", profile_id=str(profileId));
        
        return export;
    }
    
    /**
     * Delete a specific profile
     */
    @Transactional
    public void deleteProfile(UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        
        profile.setDeletedAt(LocalDateTime.now());
        profile.setIsActive(false);
        
        profileRepository.save(profile);
        
        log.info("gdpr.profile_deleted", profile_id=str(profileId));
    }
    
    /**
     * Sanitize account data for export (remove sensitive fields)
     */
    private Map<String, Object> sanitizeAccount(MasterAccount account) {
        Map<String, Object> sanitized = new HashMap<>();
        sanitized.put("id", account.getId());
        sanitized.put("email", account.getEmail());
        sanitized.put("display_name", account.getDisplayName());
        sanitized.put("tier", account.getTier());
        sanitized.put("status", account.getStatus());
        sanitized.put("created_at", account.getCreatedAt());
        sanitized.put("updated_at", account.getUpdatedAt());
        // Password hash is intentionally excluded
        return sanitized;
    }
    
    /**
     * Sanitize profile data for export
     */
    private Map<String, Object> sanitizeProfile(Profile profile) {
        Map<String, Object> sanitized = new HashMap<>();
        sanitized.put("id", profile.getId());
        sanitized.put("name", profile.getName());
        sanitized.put("relationship", profile.getRelationship());
        sanitized.put("is_active", profile.getIsActive());
        sanitized.put("created_at", profile.getCreatedAt());
        // Biometric data is intentionally excluded
        return sanitized;
    }
}
