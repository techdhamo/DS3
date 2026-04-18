package com.ds3.identity.controller;

import com.ds3.identity.service.GdprService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/identity/gdpr")
@RequiredArgsConstructor
public class GdprController {
    
    private final GdprService gdprService;
    
    @PostMapping("/export/account")
    public ResponseEntity<AccountExportResponse> exportAccountData(Authentication authentication) {
        UUID accountId = (UUID) authentication.getPrincipal();
        
        Map<String, Object> data = gdprService.exportAccountData(accountId);
        
        return ResponseEntity.ok(AccountExportResponse.builder()
            .accountId(accountId)
            .exportDate((java.time.LocalDateTime) data.get("export_date"))
            .data(data)
            .build());
    }
    
    @PostMapping("/delete/account")
    public ResponseEntity<DeletionResponse> requestAccountDeletion(
            Authentication authentication,
            @RequestBody DeletionRequest request) {
        
        UUID accountId = (UUID) authentication.getPrincipal();
        
        gdprService.requestAccountDeletion(accountId, request.getReason());
        
        return ResponseEntity.ok(DeletionResponse.builder()
            .accountId(accountId)
            .status("deletion_requested")
            .message("Account deletion requested. Data will be permanently deleted within 24 hours.")
            .build());
    }
    
    @PostMapping("/export/profile/{profileId}")
    public ResponseEntity<ProfileExportResponse> exportProfileData(
            @PathVariable UUID profileId,
            Authentication authentication) {
        
        UUID accountId = (UUID) authentication.getPrincipal();
        
        // TODO: Verify profile belongs to account
        
        Map<String, Object> data = gdprService.exportProfileData(profileId);
        
        return ResponseEntity.ok(ProfileExportResponse.builder()
            .profileId(profileId)
            .exportDate((java.time.LocalDateTime) data.get("export_date"))
            .data(data)
            .build());
    }
    
    @DeleteMapping("/profile/{profileId}")
    public ResponseEntity<DeletionResponse> deleteProfile(
            @PathVariable UUID profileId,
            Authentication authentication) {
        
        UUID accountId = (UUID) authentication.getPrincipal();
        
        // TODO: Verify profile belongs to account
        
        gdprService.deleteProfile(profileId);
        
        return ResponseEntity.ok(DeletionResponse.builder()
            .profileId(profileId)
            .status("deleted")
            .message("Profile deleted successfully.")
            .build());
    }
    
    @Data
    @lombok.Builder
    public static class AccountExportResponse {
        private UUID accountId;
        private java.time.LocalDateTime exportDate;
        private Map<String, Object> data;
    }
    
    @Data
    @lombok.Builder
    public static class ProfileExportResponse {
        private UUID profileId;
        private java.time.LocalDateTime exportDate;
        private Map<String, Object> data;
    }
    
    @Data
    public static class DeletionRequest {
        private String reason;
    }
    
    @Data
    @lombok.Builder
    public static class DeletionResponse {
        private UUID accountId;
        private UUID profileId;
        private String status;
        private String message;
    }
}
