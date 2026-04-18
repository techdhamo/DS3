package com.ds3.integration.infrastructure.controller

import com.ds3.integration.application.ports.in.UploadCsvUseCase
import com.ds3.integration.application.ports.in.UploadResult
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/v1/integration")
class UploadController(
    private val uploadCsvUseCase: UploadCsvUseCase
) {
    
    @PostMapping("/upload/csv")
    fun uploadCsv(
        @RequestParam vendorId: String,
        @RequestParam file: MultipartFile
    ): ResponseEntity<UploadResult> {
        val result = uploadCsvUseCase.upload(vendorId, file)
        return ResponseEntity.accepted().body(result)
    }
    
    @GetMapping("/uploads/{uploadId}")
    fun getUploadStatus(@PathVariable uploadId: String): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf(
            "uploadId" to uploadId,
            "status" to "processing"
        ))
    }
}
