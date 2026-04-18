package com.ds3.identity.service;

import com.ds3.identity.model.MasterAccount;
import com.ds3.identity.model.PrivacySettings;
import com.ds3.identity.model.Profile;
import com.ds3.identity.repository.MasterAccountRepository;
import com.ds3.identity.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterAccountService {
    
    private final MasterAccountRepository masterAccountRepository;
    private final ProfileRepository profileRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    @Auditable(action = "create", resourceType = "master_account")
    @Transactional
    public MasterAccount createAccount(String email, String password, String displayName) {
        // Check if email already exists
        if (masterAccountRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create master account
        MasterAccount account = MasterAccount.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .displayName(displayName)
            .tier("free")
            .status("active")
            .build();
        
        account = masterAccountRepository.save(account);
        
        // Create primary "self" profile
        Profile selfProfile = Profile.builder()
            .masterAccount(account)
            .name("Me")
            .relationship("self")
            .isPrimary(true)
            .isActive(true)
            .privacySettings(new PrivacySettings())
            .sortOrder(0)
            .build();
        
        profileRepository.save(selfProfile);
        
        return account;
    }
    
    @Transactional(readOnly = true)
    public MasterAccount getAccount(UUID id) {
        return masterAccountRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new RuntimeException("Account not found"));
    }
    
    @Auditable(action = "update", resourceType = "master_account")
    @Transactional
    public MasterAccount updateAccount(UUID id, String displayName, String phone) {
        MasterAccount account = getAccount(id);
        
        if (displayName != null) {
            account.setDisplayName(displayName);
        }
        
        if (phone != null) {
            account.setPhone(phone);
        }
        
        return masterAccountRepository.save(account);
    }
    
    @Auditable(action = "delete", resourceType = "master_account")
    @Transactional
    public void deleteAccount(UUID id) {
        MasterAccount account = getAccount(id);
        account.setDeletedAt(LocalDateTime.now());
        account.setStatus("pending_deletion");
        masterAccountRepository.save(account);
        
        // Soft delete all profiles
        profileRepository.findAllByMasterAccountId(id).forEach(profile -> {
            profile.setDeletedAt(LocalDateTime.now());
            profile.setIsActive(false);
            profileRepository.save(profile);
        });
    }
    
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
