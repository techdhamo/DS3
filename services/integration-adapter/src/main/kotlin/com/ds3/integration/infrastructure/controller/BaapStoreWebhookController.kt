package com.ds3.integration.infrastructure.controller

import com.ds3.integration.application.service.BaapStoreSyncService
import com.ds3.integration.application.service.BaapStoreOrderService
import com.ds3.integration.infrastructure.adapter.BaapStoreOrder
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/integration/baapstore")
class BaapStoreWebhookController(
    private val baapStoreSyncService: BaapStoreSyncService,
    private val baapStoreOrderService: BaapStoreOrderService
) {
    
    @PostMapping("/webhook/order")
    fun handleOrderWebhook(@RequestBody webhook: BaapStoreWebhook): ResponseEntity<Map<String, String>> {
        // Handle order status updates from BaapStore
        return ResponseEntity.ok(mapOf(
            "status" to "received",
            "orderId" to webhook.orderId
        ))
    }
    
    @PostMapping("/webhook/inventory")
    fun handleInventoryWebhook(@RequestBody webhook: BaapStoreInventoryWebhook): ResponseEntity<Map<String, String>> {
        // Sync inventory for the SKU
        baapStoreSyncService.syncInventory(webhook.sku)
        
        return ResponseEntity.ok(mapOf(
            "status" to "synced",
            "sku" to webhook.sku
        ))
    }
    
    @PostMapping("/sync/products")
    fun triggerProductSync(): ResponseEntity<Map<String, Any>> {
        val result = baapStoreSyncService.syncProducts()
        
        return ResponseEntity.ok(mapOf(
            "totalProducts" to result.totalProducts,
            "status" to result.status
        ))
    }
    
    @PostMapping("/orders")
    fun placeOrder(@RequestBody order: BaapStoreOrder): ResponseEntity<Any> {
        val response = baapStoreOrderService.placeOrder(order)
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/orders/{orderId}/status")
    fun getOrderStatus(@PathVariable orderId: String): ResponseEntity<Any> {
        val status = baapStoreOrderService.getOrderStatus(orderId)
        return ResponseEntity.ok(status)
    }
}

data class BaapStoreWebhook(
    val eventType: String,
    val orderId: String,
    val status: String,
    val timestamp: String
)

data class BaapStoreInventoryWebhook(
    val eventType: String,
    val sku: String,
    val stock: Int,
    val timestamp: String
)
