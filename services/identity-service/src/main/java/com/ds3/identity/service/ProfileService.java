package com.ds3.identity.service;

import com.ds3.identity.model.MasterAccount;
import com.ds3.identity.model.PrivacySettings;
import com.ds3.identity.model.Profile;
import com.ds3.identity.repository.MasterAccountRepository;
import com.ds3.identity.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {
    
    private final ProfileRepository profileRepository;
    private final MasterAccountRepository masterAccountRepository;
    
    @Transactional(readOnly = true)
    public List<Profile> getProfilesByMasterAccount(UUID masterAccountId) {
        return profileRepository.findActiveByMasterAccountId(masterAccountId);
    }
    
    @Transactional(readOnly = true)
    public Profile getProfile(UUID profileId, UUID requesterId) {
        Profile profile = profileRepository.findActiveById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        // Check if requester is the owner
        boolean isOwner = profile.getMasterAccount().getId().equals(requesterId);
        if (!isOwner && !profile.getIsActive()) {
            throw new RuntimeException("Profile not accessible");
        }
        
        return profile;
    }
    
    @Transactional
    public Profile createProfile(UUID masterAccountId, String name, String relationship, 
                                  PrivacySettings privacySettings) {
        MasterAccount masterAccount = masterAccountRepository.findById(masterAccountId)
            .orElseThrow(() -> new RuntimeException("Master account not found"));
        
        // Check if name already exists
        if (profileRepository.findByMasterAccountIdAndName(masterAccountId, name).isPresent()) {
            throw new RuntimeException("Profile with this name already exists");
        }
        
        Profile profile = Profile.builder()
            .masterAccount(masterAccount)
            .name(name)
            .relationship(relationship != null ? relationship : "self")
            .privacySettings(privacySettings != null ? privacySettings : new PrivacySettings())
            .isActive(true)
            .isPrimary(profileRepository.countByMasterAccountId(masterAccountId) == 0)
            .sortOrder((int) profileRepository.countByMasterAccountId(masterAccountId))
            .build();
        
        return profileRepository.save(profile);
    }
    
    @Transactional
    public Profile updateProfile(UUID profileId, UUID masterAccountId, String name, 
                                  PrivacySettings privacySettings) {
        Profile profile = profileRepository.findActiveById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        // Verify ownership
        if (!profile.getMasterAccount().getId().equals(masterAccountId)) {
            throw new RuntimeException("Not authorized to update this profile");
        }
        
        if (name != null && !name.equals(profile.getName())) {
            // Check for duplicate name
            if (profileRepository.findByMasterAccountIdAndName(masterAccountId, name).isPresent()) {
                throw new RuntimeException("Profile with this name already exists");
            }
            profile.setName(name);
        }
        
        if (privacySettings != null) {
            profile.setPrivacySettings(privacySettings);
        }
        
        return profileRepository.save(profile);
    }
    
    @Transactional
    public void deleteProfile(UUID profileId, UUID masterAccountId) {
        Profile profile = profileRepository.findActiveById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        // Verify ownership
        if (!profile.getMasterAccount().getId().equals(masterAccountId)) {
            throw new RuntimeException("Not authorized to delete this profile");
        }
        
        // Cannot delete primary profile if it's the only one
        if (profile.getIsPrimary() && profileRepository.countByMasterAccountId(masterAccountId) == 1) {
            throw new RuntimeException("Cannot delete the only primary profile");
        }
        
        profile.setDeletedAt(LocalDateTime.now());
        profile.setIsActive(false);
        profileRepository.save(profile);
    }
    
    @Transactional
    public Profile setPrimaryProfile(UUID profileId, UUID masterAccountId) {
        // Unset current primary
        profileRepository.findPrimaryByMasterAccountId(masterAccountId)
            .ifPresent(currentPrimary -> {
                currentPrimary.setIsPrimary(false);
                profileRepository.save(currentPrimary);
            });
        
        // Set new primary
        Profile newPrimary = profileRepository.findActiveById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (!newPrimary.getMasterAccount().getId().equals(masterAccountId)) {
            throw new RuntimeException("Not authorized");
        }
        
        newPrimary.setIsPrimary(true);
        return profileRepository.save(newPrimary);
    }
}
