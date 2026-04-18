package com.ds3.identity.controller;

import com.ds3.identity.model.MasterAccount;
import com.ds3.identity.service.MasterAccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/identity/master-accounts")
@RequiredArgsConstructor
public class MasterAccountController {
    
    private final MasterAccountService masterAccountService;
    
    @PostMapping
    public ResponseEntity<MasterAccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {
        
        MasterAccount account = masterAccountService.createAccount(
            request.getEmail(),
            request.getPassword(),
            request.getDisplayName()
        );
        
        return ResponseEntity.status(201).body(toResponse(account));
    }
    
    @GetMapping("/me")
    public ResponseEntity<MasterAccountResponse> getCurrentAccount(Authentication authentication) {
        UUID accountId = (UUID) authentication.getPrincipal();
        MasterAccount account = masterAccountService.getAccount(accountId);
        return ResponseEntity.ok(toResponse(account));
    }
    
    @PatchMapping("/me")
    public ResponseEntity<MasterAccountResponse> updateAccount(
            Authentication authentication,
            @RequestBody UpdateAccountRequest request) {
        UUID accountId = (UUID) authentication.getPrincipal();
        
        MasterAccount account = masterAccountService.updateAccount(
            accountId,
            request.getDisplayName(),
            request.getPhone()
        );
        
        return ResponseEntity.ok(toResponse(account));
    }
    
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        UUID accountId = (UUID) authentication.getPrincipal();
        
        masterAccountService.deleteAccount(accountId);
        return ResponseEntity.noContent().build();
    }
    
    private MasterAccountResponse toResponse(MasterAccount account) {
        MasterAccountResponse response = new MasterAccountResponse();
        response.setId(account.getId());
        response.setEmail(account.getEmail());
        response.setEmailVerified(account.getEmailVerified());
        response.setDisplayName(account.getDisplayName());
        response.setTier(account.getTier());
        response.setStatus(account.getStatus());
        response.setCreatedAt(account.getCreatedAt());
        return response;
    }
    
    @Data
    public static class CreateAccountRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;
        
        @NotBlank(message = "Display name is required")
        @Size(max = 100, message = "Display name must not exceed 100 characters")
        private String displayName;
    }
    
    @Data
    public static class UpdateAccountRequest {
        private String displayName;
        private String phone;
    }
    
    @Data
    public static class MasterAccountResponse {
        private UUID id;
        private String email;
        private Boolean emailVerified;
        private String displayName;
        private String tier;
        private String status;
        private java.time.LocalDateTime createdAt;
    }
}
