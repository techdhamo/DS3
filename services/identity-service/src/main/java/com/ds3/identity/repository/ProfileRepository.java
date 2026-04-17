package com.ds3.identity.repository;

import com.ds3.identity.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    
    @Query("SELECT p FROM Profile p WHERE p.masterAccount.id = :masterAccountId AND p.deletedAt IS NULL ORDER BY p.sortOrder")
    List<Profile> findAllByMasterAccountId(@Param("masterAccountId") UUID masterAccountId);
    
    @Query("SELECT p FROM Profile p WHERE p.masterAccount.id = :masterAccountId AND p.isActive = true AND p.deletedAt IS NULL ORDER BY p.sortOrder")
    List<Profile> findActiveByMasterAccountId(@Param("masterAccountId") UUID masterAccountId);
    
    @Query("SELECT p FROM Profile p WHERE p.masterAccount.id = :masterAccountId AND p.isPrimary = true AND p.deletedAt IS NULL")
    Optional<Profile> findPrimaryByMasterAccountId(@Param("masterAccountId") UUID masterAccountId);
    
    @Query("SELECT p FROM Profile p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Profile> findActiveById(@Param("id") UUID id);
    
    @Query("SELECT p FROM Profile p WHERE p.masterAccount.id = :masterAccountId AND p.name = :name AND p.deletedAt IS NULL")
    Optional<Profile> findByMasterAccountIdAndName(@Param("masterAccountId") UUID masterAccountId, @Param("name") String name);
    
    @Query("SELECT COUNT(p) FROM Profile p WHERE p.masterAccount.id = :masterAccountId AND p.deletedAt IS NULL")
    long countByMasterAccountId(@Param("masterAccountId") UUID masterAccountId);
    
    @Query("SELECT p FROM Profile p WHERE p.vectorStatus = 'pending' AND p.deletedAt IS NULL")
    List<Profile> findPendingVectorGeneration();
    
    @Query("SELECT p FROM Profile p WHERE p.avatarUrl3d IS NULL AND p.deletedAt IS NULL")
    List<Profile> findPendingAvatarGeneration();
}
