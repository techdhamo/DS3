package com.ds3.integration.application.service

import com.ds3.integration.infrastructure.adapter.FactoriGraphQLClient
import com.ds3.integration.application.ports.out.KafkaPublisherPort
import org.springframework.stereotype.Service

@Service
class FactoriSyncService(
    private val factoriGraphQLClient: FactoriGraphQLClient,
    private val kafkaPublisher: KafkaPublisherPort
) {
    
    fun syncProducts(): SyncResult {
        var totalSynced = 0
        var hasNextPage = true
        var cursor: String? = null
        
        while (hasNextPage) {
            val response = factoriGraphQLClient.getProducts(100, cursor).block()
            
            response?.edges?.forEach { edge ->
                val product = edge.node
                kafkaPublisher.publish(
                    topic = "vendor.products",
                    key = "FACTORI-${product.sku}",
                    data = mapOf(
                        "vendor" to "FACTORI",
                        "action" to "sync",
                        "product" to product
                    )
                )
                totalSynced++
            }
            
            hasNextPage = response?.pageInfo?.hasNextPage ?: false
            cursor = response?.pageInfo?.endCursor
        }
        
        return SyncResult(
            totalProducts = totalSynced,
            status = "completed"
        )
    }
}

data class SyncResult(
    val totalProducts: Int,
    val status: String
)
