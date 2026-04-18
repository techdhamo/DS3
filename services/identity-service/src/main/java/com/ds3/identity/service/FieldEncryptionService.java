package com.ds3.identity.service;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class FieldEncryptionService {
    
    private final EncryptionService encryptionService;
    
    public FieldEncryptionService(EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }
    
    /**
     * Encrypt a field value
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }
        
        if (!encryptionService.isConfigured()) {
            log.warn("Encryption not configured, returning plaintext");
            return plaintext;
        }
        
        try {
            return encryptionService.encrypt(plaintext);
        } catch (Exception e) {
            log.error("Failed to encrypt field", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }
    
    /**
     * Decrypt a field value
     */
    public String decrypt(String ciphertext) {
        if (ciphertext == null || ciphertext.isEmpty()) {
            return ciphertext;
        }
        
        if (!encryptionService.isConfigured()) {
            log.warn("Encryption not configured, returning ciphertext as plaintext");
            return ciphertext;
        }
        
        try {
            return encryptionService.decrypt(ciphertext);
        } catch (Exception e) {
            log.error("Failed to decrypt field", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }
    
    /**
     * JPA Converter for encrypted fields
     */
    @Converter(autoApply = false)
    public static class EncryptedConverter implements AttributeConverter<String, String> {
        
        private static FieldEncryptionService fieldEncryptionService;
        
        public void setFieldEncryptionService(FieldEncryptionService service) {
            fieldEncryptionService = service;
        }
        
        @Override
        public String convertToDatabaseColumn(String attribute) {
            if (fieldEncryptionService == null) {
                return attribute;
            }
            return fieldEncryptionService.encrypt(attribute);
        }
        
        @Override
        public String convertToEntityAttribute(String dbData) {
            if (fieldEncryptionService == null) {
                return dbData;
            }
            return fieldEncryptionService.decrypt(dbData);
        }
    }
}
