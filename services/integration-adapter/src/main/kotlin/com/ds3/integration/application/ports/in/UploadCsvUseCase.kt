package com.ds3.integration.application.ports.in

import org.springframework.web.multipart.MultipartFile

interface UploadCsvUseCase {
    fun upload(vendorId: String, file: MultipartFile): UploadResult
}

data class UploadResult(
    val uploadId: String,
    val status: String,
    val totalRows: Int,
    val message: String
)
