package com.ds3.integration.application.service

import com.ds3.integration.application.ports.in.UploadCsvUseCase
import com.ds3.integration.application.ports.in.UploadResult
import com.ds3.integration.application.ports.out.CsvParserPort
import com.ds3.integration.application.ports.out.KafkaPublisherPort
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class UploadCsvService(
    private val csvParser: CsvParserPort,
    private val kafkaPublisher: KafkaPublisherPort
) : UploadCsvUseCase {
    
    override fun upload(vendorId: String, file: MultipartFile): UploadResult {
        val uploadId = UUID.randomUUID().toString()
        
        // Parse CSV
        val rows = csvParser.parse(file.inputStream)
        
        // Publish to Kafka for async processing
        kafkaPublisher.publish(
            topic = "csv.uploads",
            key = uploadId,
            data = mapOf(
                "uploadId" to uploadId,
                "vendorId" to vendorId,
                "filename" to file.originalFilename,
                "totalRows" to rows.size
            )
        )
        
        return UploadResult(
            uploadId = uploadId,
            status = "processing",
            totalRows = rows.size,
            message = "CSV uploaded successfully, processing started"
        )
    }
}
