package com.ds3.integration.application.service

import com.ds3.integration.infrastructure.adapter.BaapStoreApiClient
import com.ds3.integration.application.ports.out.KafkaPublisherPort
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

@Service
class BaapStoreSyncService(
    private val baapStoreApiClient: BaapStoreApiClient,
    private val kafkaPublisher: KafkaPublisherPort
) {
    
    fun syncProducts(): SyncResult {
        var totalSynced = 0
        var page = 1
        val pageSize = 100
        
        while (true) {
            val products = baapStoreApiClient.getProducts(page, pageSize).collectList().block()
            
            if (products.isNullOrEmpty()) break
            
            products.forEach { product ->
                kafkaPublisher.publish(
                    topic = "vendor.products",
                    key = "BAAPSTORE-${product.sku}",
                    data = mapOf(
                        "vendor" to "BAAPSTORE",
                        "action" to "sync",
                        "product" to product
                    )
                )
                totalSynced++
            }
            
            if (products.size < pageSize) break
            page++
        }
        
        return SyncResult(
            totalProducts = totalSynced,
            status = "completed"
        )
    }
    
    fun syncInventory(sku: String) {
        val inventory = baapStoreApiClient.getInventory(sku).block()
        
        kafkaPublisher.publish(
            topic = "vendor.inventory",
            key = "BAAPSTORE-$sku",
            data = mapOf(
                "vendor" to "BAAPSTORE",
                "sku" to sku,
                "inventory" to inventory
            )
        )
    }
}

data class SyncResult(
    val totalProducts: Int,
    val status: String
)
