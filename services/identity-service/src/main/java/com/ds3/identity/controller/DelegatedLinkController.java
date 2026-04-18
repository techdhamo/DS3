package com.ds3.identity.controller;

import com.ds3.identity.model.DelegatedLink;
import com.ds3.identity.model.DelegatedPermissions;
import com.ds3.identity.service.DelegatedLinkService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/identity/delegated-links")
@RequiredArgsConstructor
public class DelegatedLinkController {
    
    private final DelegatedLinkService delegatedLinkService;
    
    @GetMapping("/my-links")
    public ResponseEntity<List<DelegatedLinkResponse>> getMyLinks(
            @RequestHeader("X-Master-Account-Id") UUID accountId) {
        
        List<DelegatedLink> links = delegatedLinkService.getLinksForDelegator(accountId);
        List<DelegatedLinkResponse> responses = links.stream()
            .map(this::toResponse)
            .toList();
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/my-shared-profiles")
    public ResponseEntity<List<DelegatedLinkResponse>> getMySharedProfiles(
            @RequestHeader("X-Master-Account-Id") UUID accountId) {
        
        List<DelegatedLink> links = delegatedLinkService.getLinksForOwner(accountId);
        List<DelegatedLinkResponse> responses = links.stream()
            .map(this::toResponse)
            .toList();
        
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/invite")
    public ResponseEntity<DelegatedLinkResponse> createInvitation(
            @RequestHeader("X-Master-Account-Id") UUID ownerId,
            @Valid @RequestBody CreateInvitationRequest request) {
        
        DelegatedLink link = delegatedLinkService.createInvitation(
            ownerId,
            request.getProfileId(),
            request.getInviteeEmail(),
            request.getPermissions(),
            request.getMessage()
        );
        
        return ResponseEntity.status(201).body(toResponse(link));
    }
    
    @PostMapping("/accept/{token}")
    public ResponseEntity<DelegatedLinkResponse> acceptInvitation(
            @PathVariable String token,
            Authentication authentication) {
        
        UUID accountId = (UUID) authentication.getPrincipal();
        
        DelegatedLink link = delegatedLinkService.acceptInvitation(token, accountId);
        
        return ResponseEntity.ok(toResponse(link));
    }
    
    @PostMapping("/reject/{token}")
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable String token,
            Authentication authentication) {
        
        UUID accountId = (UUID) authentication.getPrincipal();
        
        delegatedLinkService.rejectInvitation(token, accountId);
        
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/revoke")
    public ResponseEntity<Void> revokeLink(
            @PathVariable UUID id,
            @RequestHeader("X-Master-Account-Id") UUID ownerId) {
        
        delegatedLinkService.revokeLink(id, ownerId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DelegatedLinkResponse> getLink(
            @PathVariable UUID id,
            @RequestHeader("X-Master-Account-Id") UUID userId) {
        
        DelegatedLink link = delegatedLinkService.getLink(id, userId);
        return ResponseEntity.ok(toResponse(link));
    }
    
    @GetMapping("/permissions/options")
    public ResponseEntity<PermissionOptionsResponse> getPermissionOptions() {
        PermissionOptionsResponse options = PermissionOptionsResponse.builder()
            .viewSize(PermissionOption.builder()
                .key("canViewSize")
                .label("View Size Measurements")
                .description("Allow viewing body measurements and sizing data")
                .build())
            .viewStyle(PermissionOption.builder()
                .key("canViewStyle")
                .label("View Style Preferences")
                .description("Allow viewing style preferences and fashion choices")
                .build())
            .orderFor(PermissionOption.builder()
                .key("canOrderFor")
                .label("Order Items for This Profile")
                .description("Allow placing orders on behalf of this profile")
                .build())
            .viewBiometrics(PermissionOption.builder()
                .key("canViewBiometrics")
                .label("View Biometric Attributes")
                .description("Allow viewing detailed biometric analysis")
                .build())
            .viewAvatar(PermissionOption.builder()
                .key("canViewAvatar")
                .label("View 3D Avatar")
                .description("Allow viewing the 3D avatar representation")
                .build())
            .build();
        
        return ResponseEntity.ok(options);
    }
    
    @Transactional(readOnly = true)
    public DelegatedLinkResponse toResponse(DelegatedLink link) {
        DelegatedLinkResponse response = new DelegatedLinkResponse();
        response.setId(link.getId());
        response.setOwnerProfileId(link.getOwnerProfile() != null ? link.getOwnerProfile().getId() : null);
        response.setOwnerProfileName(link.getOwnerProfile() != null ? link.getOwnerProfile().getName() : null);
        response.setOwnerEmail(link.getOwnerAccount() != null ? link.getOwnerAccount().getEmail() : null);
        response.setDelegatorEmail(link.getDelegatorAccount() != null ? link.getDelegatorAccount().getEmail() : null);
        response.setStatus(link.getStatus());
        response.setPermissions(link.getPermissions());
        response.setInvitationExpiresAt(link.getInvitationExpiresAt());
        response.setAccessCount(link.getAccessCount());
        response.setCreatedAt(link.getCreatedAt());
        return response;
    }
    
    @Data
    public static class CreateInvitationRequest {
        @NotNull(message = "Profile ID is required")
        private UUID profileId;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String inviteeEmail;
        
        private DelegatedPermissions permissions;
        private String message;
    }
    
    @Data
    public static class DelegatedLinkResponse {
        private UUID id;
        private UUID ownerProfileId;
        private String ownerProfileName;
        private String ownerEmail;
        private String delegatorEmail;
        private String status;
        private DelegatedPermissions permissions;
        private java.time.LocalDateTime invitationExpiresAt;
        private Integer accessCount;
        private java.time.LocalDateTime createdAt;
    }
    
    @Data
    @lombok.Builder
    public static class PermissionOption {
        private String key;
        private String label;
        private String description;
    }
    
    @Data
    @lombok.Builder
    public static class PermissionOptionsResponse {
        private PermissionOption viewSize;
        private PermissionOption viewStyle;
        private PermissionOption orderFor;
        private PermissionOption viewBiometrics;
        private PermissionOption viewAvatar;
    }
}
