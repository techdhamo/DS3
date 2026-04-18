package com.ds3.identity.service;

import com.ds3.identity.model.DelegatedLink;
import com.ds3.identity.model.DelegatedPermissions;
import com.ds3.identity.model.MasterAccount;
import com.ds3.identity.model.Profile;
import com.ds3.identity.repository.DelegatedLinkRepository;
import com.ds3.identity.repository.MasterAccountRepository;
import com.ds3.identity.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DelegatedLinkService {
    
    private final DelegatedLinkRepository delegatedLinkRepository;
    private final MasterAccountRepository masterAccountRepository;
    private final ProfileRepository profileRepository;
    
    @Transactional
    public DelegatedLink createInvitation(UUID ownerId, UUID profileId, String inviteeEmail, 
                                           DelegatedPermissions permissions, String message) {
        MasterAccount owner = masterAccountRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner account not found"));
        
        Profile profile = profileRepository.findActiveById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        // Verify profile belongs to owner
        if (!profile.getMasterAccount().getId().equals(ownerId)) {
            throw new RuntimeException("Profile does not belong to owner");
        }
        
        // Find invitee account by email
        MasterAccount invitee = masterAccountRepository.findByEmailAndDeletedAtIsNull(inviteeEmail)
            .orElseThrow(() -> new RuntimeException("Invitee account not found"));
        
        // Check if link already exists
        if (delegatedLinkRepository.findByDelegatorAndProfile(invitee.getId(), profileId).isPresent()) {
            throw new RuntimeException("Invitation already exists for this profile");
        }
        
        // Generate invitation token
        String token = UUID.randomUUID().toString();
        
        DelegatedLink link = DelegatedLink.builder()
            .delegatorAccount(invitee)
            .ownerAccount(owner)
            .ownerProfile(profile)
            .invitationToken(token)
            .status("pending")
            .permissions(permissions != null ? permissions : new DelegatedPermissions())
            .invitationSentVia("email")
            .invitationMessage(message)
            .build();
        
        return delegatedLinkRepository.save(link);
    }
    
    @Transactional
    public DelegatedLink acceptInvitation(String token, UUID inviteeId) {
        DelegatedLink link = delegatedLinkRepository.findByInvitationToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid invitation token"));
        
        if (!"pending".equals(link.getStatus())) {
            throw new RuntimeException("Invitation is no longer valid");
        }
        
        if (link.isExpired()) {
            link.setStatus("expired");
            delegatedLinkRepository.save(link);
            throw new RuntimeException("Invitation has expired");
        }
        
        if (!link.getDelegatorAccount().getId().equals(inviteeId)) {
            throw new RuntimeException("This invitation is not for you");
        }
        
        link.setStatus("accepted");
        link.setAcceptedAt(LocalDateTime.now());
        
        return delegatedLinkRepository.save(link);
    }
    
    @Transactional
    public void revokeLink(UUID linkId, UUID ownerId) {
        DelegatedLink link = delegatedLinkRepository.findById(linkId)
            .orElseThrow(() -> new RuntimeException("Link not found"));
        
        if (!link.getOwnerAccount().getId().equals(ownerId)) {
            throw new RuntimeException("Not authorized to revoke this link");
        }
        
        link.setStatus("revoked");
        delegatedLinkRepository.save(link);
    }
    
    @Transactional(readOnly = true)
    public List<DelegatedLink> getLinksForDelegator(UUID delegatorId) {
        return delegatedLinkRepository.findActiveByDelegatorId(delegatorId);
    }
    
    @Transactional(readOnly = true)
    public List<DelegatedLink> getLinksForOwner(UUID ownerId) {
        return delegatedLinkRepository.findByOwnerId(ownerId);
    }
    
    @Transactional(readOnly = true)
    public DelegatedLink getLink(UUID linkId, UUID userId) {
        DelegatedLink link = delegatedLinkRepository.findById(linkId)
            .orElseThrow(() -> new RuntimeException("Link not found"));
        
        // User must be either owner or delegator
        if (!link.getOwnerAccount().getId().equals(userId) && 
            !link.getDelegatorAccount().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to view this link");
        }
        
        return link;
    }
    
    @Transactional(readOnly = true)
    public boolean canAccessProfile(UUID delegatorId, UUID profileId, String permission) {
        return delegatedLinkRepository.findByDelegatorAndProfile(delegatorId, profileId)
            .filter(link -> "accepted".equals(link.getStatus()))
            .map(link -> link.getPermissions().hasPermission(permission))
            .orElse(false);
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAccess(UUID linkId) {
        delegatedLinkRepository.findById(linkId).ifPresent(link -> {
            link.recordAccess();
            delegatedLinkRepository.save(link);
        });
    }
}
