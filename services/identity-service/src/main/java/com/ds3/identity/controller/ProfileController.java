package com.ds3.identity.controller;

import com.ds3.identity.model.PrivacySettings;
import com.ds3.identity.model.Profile;
import com.ds3.identity.service.ProfileService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/identity/profiles")
@RequiredArgsConstructor
public class ProfileController {
    
    private final ProfileService profileService;
    
    @GetMapping
    public ResponseEntity<List<ProfileResponse>> getProfiles(
            @RequestHeader("X-Master-Account-Id") UUID masterAccountId) {
        
        List<Profile> profiles = profileService.getProfilesByMasterAccount(masterAccountId);
        List<ProfileResponse> responses = profiles.stream()
            .map(this::toResponse)
            .toList();
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getProfile(
            @PathVariable UUID id,
            @RequestHeader("X-Master-Account-Id") UUID masterAccountId) {
        
        Profile profile = profileService.getProfile(id, masterAccountId);
        return ResponseEntity.ok(toResponse(profile));
    }
    
    @PostMapping
    public ResponseEntity<ProfileResponse> createProfile(
            @RequestHeader("X-Master-Account-Id") UUID masterAccountId,
            @RequestBody CreateProfileRequest request) {
        
        Profile profile = profileService.createProfile(
            masterAccountId,
            request.getName(),
            request.getRelationship(),
            request.getPrivacySettings()
        );
        
        return ResponseEntity.status(201).body(toResponse(profile));
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<ProfileResponse> updateProfile(
            @PathVariable UUID id,
            @RequestHeader("X-Master-Account-Id") UUID masterAccountId,
            @RequestBody UpdateProfileRequest request) {
        
        Profile profile = profileService.updateProfile(
            id,
            masterAccountId,
            request.getName(),
            request.getPrivacySettings()
        );
        
        return ResponseEntity.ok(toResponse(profile));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(
            @PathVariable UUID id,
            @RequestHeader("X-Master-Account-Id") UUID masterAccountId) {
        
        profileService.deleteProfile(id, masterAccountId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/set-primary")
    public ResponseEntity<ProfileResponse> setPrimary(
            @PathVariable UUID id,
            @RequestHeader("X-Master-Account-Id") UUID masterAccountId) {
        
        Profile profile = profileService.setPrimaryProfile(id, masterAccountId);
        return ResponseEntity.ok(toResponse(profile));
    }
    
    private ProfileResponse toResponse(Profile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setId(profile.getId());
        response.setName(profile.getName());
        response.setNickname(profile.getNickname());
        response.setRelationship(profile.getRelationship());
        response.setAgeGroup(profile.getAgeGroup());
        response.setGender(profile.getGender());
        response.setAvatarUrl3d(profile.getAvatarUrl3d());
        response.setAvatarFormat(profile.getAvatarFormat());
        response.setVectorStatus(profile.getVectorStatus());
        response.setPrivacySettings(profile.getPrivacySettings());
        response.setIsPrimary(profile.getIsPrimary());
        response.setIsActive(profile.getIsActive());
        response.setSortOrder(profile.getSortOrder());
        response.setCreatedAt(profile.getCreatedAt());
        return response;
    }
    
    // Request/Response DTOs
    @Data
    public static class CreateProfileRequest {
        private String name;
        private String relationship;
        private PrivacySettings privacySettings;
    }
    
    @Data
    public static class UpdateProfileRequest {
        private String name;
        private PrivacySettings privacySettings;
    }
    
    @Data
    public static class ProfileResponse {
        private UUID id;
        private String name;
        private String nickname;
        private String relationship;
        private String ageGroup;
        private String gender;
        private String avatarUrl3d;
        private String avatarFormat;
        private String vectorStatus;
        private PrivacySettings privacySettings;
        private Boolean isPrimary;
        private Boolean isActive;
        private Integer sortOrder;
        private java.time.LocalDateTime createdAt;
    }
}
