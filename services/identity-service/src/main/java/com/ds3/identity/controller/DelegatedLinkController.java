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
            @RequestHeader("X-Master-Account-Id") UUID inviteeId) {
        
        DelegatedLink link = delegatedLinkService.acceptInvitation(token, inviteeId);
        return ResponseEntity.ok(toResponse(link));
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
}
