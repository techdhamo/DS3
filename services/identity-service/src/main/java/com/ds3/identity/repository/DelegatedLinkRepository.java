package com.ds3.identity.repository;

import com.ds3.identity.model.DelegatedLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DelegatedLinkRepository extends JpaRepository<DelegatedLink, UUID> {
    
    @Query("SELECT dl FROM DelegatedLink dl " +
           "LEFT JOIN FETCH dl.ownerProfile LEFT JOIN FETCH dl.ownerAccount LEFT JOIN FETCH dl.delegatorAccount " +
           "WHERE dl.delegatorAccount.id = :delegatorId AND dl.status = 'accepted'")
    List<DelegatedLink> findActiveByDelegatorId(@Param("delegatorId") UUID delegatorId);
    
    @Query("SELECT dl FROM DelegatedLink dl " +
           "LEFT JOIN FETCH dl.ownerProfile LEFT JOIN FETCH dl.ownerAccount LEFT JOIN FETCH dl.delegatorAccount " +
           "WHERE dl.ownerAccount.id = :ownerId")
    List<DelegatedLink> findByOwnerId(@Param("ownerId") UUID ownerId);
    
    @Query("SELECT dl FROM DelegatedLink dl " +
           "LEFT JOIN FETCH dl.ownerProfile LEFT JOIN FETCH dl.ownerAccount LEFT JOIN FETCH dl.delegatorAccount " +
           "WHERE dl.ownerProfile.id = :profileId AND dl.status = 'accepted'")
    List<DelegatedLink> findActiveByProfileId(@Param("profileId") UUID profileId);
    
    @Query("SELECT dl FROM DelegatedLink dl " +
           "LEFT JOIN FETCH dl.ownerProfile LEFT JOIN FETCH dl.ownerAccount LEFT JOIN FETCH dl.delegatorAccount " +
           "WHERE dl.invitationToken = :token")
    Optional<DelegatedLink> findByInvitationToken(@Param("token") String token);
    
    @Query("SELECT dl FROM DelegatedLink dl " +
           "LEFT JOIN FETCH dl.ownerProfile LEFT JOIN FETCH dl.ownerAccount LEFT JOIN FETCH dl.delegatorAccount " +
           "WHERE dl.delegatorAccount.id = :delegatorId AND dl.ownerProfile.id = :profileId")
    Optional<DelegatedLink> findByDelegatorAndProfile(@Param("delegatorId") UUID delegatorId, @Param("profileId") UUID profileId);
    
    @Query("SELECT dl FROM DelegatedLink dl " +
           "LEFT JOIN FETCH dl.ownerProfile LEFT JOIN FETCH dl.ownerAccount LEFT JOIN FETCH dl.delegatorAccount " +
           "WHERE dl.id = :id")
    Optional<DelegatedLink> findByIdWithAssociations(@Param("id") UUID id);
    
    @Query("SELECT CASE WHEN COUNT(dl) > 0 THEN true ELSE false END FROM DelegatedLink dl " +
           "WHERE dl.delegatorAccount.id = :delegatorId AND dl.ownerProfile.id = :profileId AND dl.status = 'accepted'")
    boolean existsActiveLink(@Param("delegatorId") UUID delegatorId, @Param("profileId") UUID profileId);
    
    @Query("SELECT dl FROM DelegatedLink dl WHERE dl.status = 'pending' AND dl.invitationExpiresAt < CURRENT_TIMESTAMP")
    List<DelegatedLink> findExpiredInvitations();
}
