package com.ds3.integration.application.service

import com.ds3.integration.infrastructure.adapter.BaapStoreApiClient
import com.ds3.integration.infrastructure.adapter.BaapStoreOrder
import org.springframework.stereotype.Service

@Service
class BaapStoreOrderService(
    private val baapStoreApiClient: BaapStoreApiClient
) {
    
    fun placeOrder(order: BaapStoreOrder): BaapStoreOrderResponse {
        return baapStoreApiClient.placeOrder(order).block()
            ?: throw RuntimeException("Failed to place order with BaapStore")
    }
    
    fun getOrderStatus(orderId: String): BaapStoreOrderStatus {
        return baapStoreApiClient.getOrderStatus(orderId).block()
            ?: throw RuntimeException("Failed to get order status from BaapStore")
    }
}
