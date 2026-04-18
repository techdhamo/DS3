package com.ds3.integration.infrastructure.controller

import com.ds3.integration.application.service.FactoriSyncService
import com.ds3.integration.infrastructure.adapter.FactoriFactoryOrder
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/integration/factori")
class FactoriController(
    private val factoriSyncService: FactoriSyncService
) {
    
    @PostMapping("/sync/products")
    fun triggerProductSync(): ResponseEntity<Map<String, Any>> {
        val result = factoriSyncService.syncProducts()
        
        return ResponseEntity.ok(mapOf(
            "totalProducts" to result.totalProducts,
            "status" to result.status
        ))
    }
    
    @PostMapping("/orders/factory")
    fun placeFactoryOrder(@RequestBody order: FactoriFactoryOrder): ResponseEntity<Map<String, String>> {
        // Placeholder for factory order placement
        return ResponseEntity.ok(mapOf(
            "status" to "received",
            "orderId" to order.orderId
        ))
    }
}
