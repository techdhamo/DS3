package com.ds3.integration.infrastructure.adapter

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.retry.annotation.Retry
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Component
class BaapStoreApiClient(
    @Value("\${baapstore.api.url}")
    private val baseUrl: String,
    @Value("\${baapstore.api.key}")
    private val apiKey: String,
    private val objectMapper: ObjectMapper
) {
    
    private val webClient = WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer $apiKey")
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build()
    
    @Retry(name = "baapStoreApi")
    @CircuitBreaker(name = "baapStoreApi")
    fun getProducts(page: Int = 1, pageSize: Int = 100): Flux<BaapStoreProduct> {
        return webClient.get()
            .uri("/api/v1/products?page=$page&limit=$pageSize")
            .retrieve()
            .bodyToFlux(BaapStoreProduct::class.java)
    }
    
    @Retry(name = "baapStoreApi")
    @CircuitBreaker(name = "baapStoreApi")
    fun getProduct(sku: String): Mono<BaapStoreProduct> {
        return webClient.get()
            .uri("/api/v1/products/$sku")
            .retrieve()
            .bodyToMono(BaapStoreProduct::class.java)
    }
    
    @Retry(name = "baapStoreApi")
    @CircuitBreaker(name = "baapStoreApi")
    fun getInventory(sku: String): Mono<BaapStoreInventory> {
        return webClient.get()
            .uri("/api/v1/inventory/$sku")
            .retrieve()
            .bodyToMono(BaapStoreInventory::class.java)
    }
    
    @Retry(name = "baapStoreApi")
    @CircuitBreaker(name = "baapStoreApi")
    fun placeOrder(order: BaapStoreOrder): Mono<BaapStoreOrderResponse> {
        return webClient.post()
            .uri("/api/v1/orders")
            .bodyValue(order)
            .retrieve()
            .bodyToMono(BaapStoreOrderResponse::class.java)
    }
    
    @Retry(name = "baapStoreApi")
    @CircuitBreaker(name = "baapStoreApi")
    fun getOrderStatus(orderId: String): Mono<BaapStoreOrderStatus> {
        return webClient.get()
            .uri("/api/v1/orders/$orderId/status")
            .retrieve()
            .bodyToMono(BaapStoreOrderStatus::class.java)
    }
}

data class BaapStoreProduct(
    val sku: String,
    val title: String,
    val description: String?,
    val price: Double,
    val compareAtPrice: Double?,
    val brand: String?,
    val category: String?,
    val images: List<String>?,
    val attributes: Map<String, String>?,
    val stock: Int,
    val weightGrams: Int?,
    val dimensions: Map<String, Double>?
)

data class BaapStoreInventory(
    val sku: String,
    val stock: Int,
    val availableStock: Int,
    val reservedStock: Int,
    val lastUpdated: String
)

data class BaapStoreOrder(
    val orderId: String,
    val items: List<BaapStoreOrderItem>,
    val shippingAddress: BaapStoreAddress,
    val customerEmail: String,
    val customerPhone: String?
)

data class BaapStoreOrderItem(
    val sku: String,
    val quantity: Int
)

data class BaapStoreAddress(
    val name: String,
    val street: String,
    val city: String,
    val state: String,
    val pincode: String,
    val country: String,
    val phone: String
)

data class BaapStoreOrderResponse(
    val orderId: String,
    val status: String,
    val estimatedDelivery: String?,
    val trackingNumber: String?
)

data class BaapStoreOrderStatus(
    val orderId: String,
    val status: String,
    val trackingNumber: String?,
    val trackingUrl: String?,
    val estimatedDelivery: String?,
    val updatedAt: String
)
