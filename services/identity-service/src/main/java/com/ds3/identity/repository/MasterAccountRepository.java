package com.ds3.identity.repository;

import com.ds3.identity.model.MasterAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MasterAccountRepository extends JpaRepository<MasterAccount, UUID> {
    
    Optional<MasterAccount> findByEmailAndDeletedAtIsNull(String email);
    
    Optional<MasterAccount> findByIdAndDeletedAtIsNull(UUID id);
    
    @Query("SELECT ma FROM MasterAccount ma WHERE ma.tenantId = :tenantId AND ma.deletedAt IS NULL")
    List<MasterAccount> findAllByTenantId(@Param("tenantId") UUID tenantId);
    
    @Query("SELECT ma FROM MasterAccount ma WHERE ma.status = 'active' AND ma.deletedAt IS NULL")
    List<MasterAccount> findAllActive();
    
    boolean existsByEmailAndDeletedAtIsNull(String email);
    
    @Query("SELECT COUNT(ma) FROM MasterAccount ma WHERE ma.tenantId = :tenantId AND ma.deletedAt IS NULL")
    long countByTenantId(@Param("tenantId") UUID tenantId);
}
