package com.ds3.integration.infrastructure.adapter

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.retry.annotation.Retry
import org.springframework.beans.factory.annotation.Value
import org.springframework.graphql.client.HttpGraphQlClient
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Component
class FactoriGraphQLClient(
    @Value("\${factori.api.url}")
    private val baseUrl: String,
    @Value("\${factori.api.key}")
    private val apiKey: String,
    private val objectMapper: ObjectMapper
) {
    
    private val webClient = WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader("X-API-Key", apiKey)
        .build()
    
    private val graphQlClient = HttpGraphQlClient.builder(webClient).build()
    
    @Retry(name = "factoriApi")
    @CircuitBreaker(name = "factoriApi")
    fun getProducts(first: Int = 100, after: String? = null): Mono<FactoriProductsResponse> {
        val query = """
            query GetProducts($first: Int, $after: String) {
                products(first: $first, after: $after) {
                    edges {
                        node {
                            id
                            sku
                            title
                            description
                            price {
                                amount
                                currency
                            }
                            stock
                            factory {
                                id
                                name
                                location
                            }
                            images {
                                url
                                isPrimary
                            }
                        }
                        cursor
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                    totalCount
                }
            }
        """.trimIndent()
        
        return graphQlClient.document(query)
            .execute()
            .map { response ->
                val data = response.field("products").toEntity(FactoriProductsResponse::class.java)
                data ?: FactoriProductsResponse(emptyList(), FactoriPageInfo(false, null), 0)
            }
    }
    
    @Retry(name = "factoriApi")
    @CircuitBreaker(name = "factoriApi")
    fun getProduct(sku: String): Mono<FactoriProduct> {
        val query = """
            query GetProduct($sku: String!) {
                product(sku: $sku) {
                    id
                    sku
                    title
                    description
                    price {
                        amount
                        currency
                    }
                    stock
                    factory {
                        id
                        name
                        location
                    }
                    images {
                        url
                        isPrimary
                    }
                }
            }
        """.trimIndent()
        
        return graphQlClient.document(query)
            .execute()
            .map { response ->
                response.field("product").toEntity(FactoriProduct::class.java) 
                    ?: throw RuntimeException("Product not found: $sku")
            }
    }
    
    @Retry(name = "factoriApi")
    @CircuitBreaker(name = "factoriApi")
    fun placeFactoryOrder(order: FactoriFactoryOrder): Mono<FactoriOrderResponse> {
        val mutation = """
            mutation PlaceFactoryOrder($order: FactoryOrderInput!) {
                placeFactoryOrder(order: $order) {
                    orderId
                    status
                    estimatedDelivery
                    factory {
                        id
                        name
                    }
                }
            }
        """.trimIndent()
        
        return graphQlClient.document(mutation)
            .variable("order", order)
            .execute()
            .map { response ->
                response.field("placeFactoryOrder").toEntity(FactoriOrderResponse::class.java)
                    ?: throw RuntimeException("Failed to place factory order")
            }
    }
}

data class FactoriProductsResponse(
    val edges: List<FactoriProductEdge>,
    val pageInfo: FactoriPageInfo,
    val totalCount: Int
)

data class FactoriProductEdge(
    val node: FactoriProduct,
    val cursor: String
)

data class FactoriPageInfo(
    val hasNextPage: Boolean,
    val endCursor: String?
)

data class FactoriProduct(
    val id: String,
    val sku: String,
    val title: String,
    val description: String?,
    val price: FactoriPrice,
    val stock: Int,
    val factory: FactoriFactory,
    val images: List<FactoriImage>
)

data class FactoriPrice(
    val amount: Double,
    val currency: String
)

data class FactoriFactory(
    val id: String,
    val name: String,
    val location: String
)

data class FactoriImage(
    val url: String,
    val isPrimary: Boolean
)

data class FactoriFactoryOrder(
    val orderId: String,
    val items: List<FactoriOrderItem>,
    val shippingAddress: FactoriAddress,
    val customerEmail: String
)

data class FactoriOrderItem(
    val sku: String,
    val quantity: Int
)

data class FactoriAddress(
    val name: String,
    val street: String,
    val city: String,
    val state: String,
    val pincode: String,
    val country: String
)

data class FactoriOrderResponse(
    val orderId: String,
    val status: String,
    val estimatedDelivery: String?,
    val factory: FactoriFactory
)
