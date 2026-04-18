package com.ds3.bundle.service

import com.ds3.bundle.model.*
import org.springframework.stereotype.Service

@Service
class BundleService {
    
    fun calculateBundleInventory(bundleId: String): BundleInventory {
        val bundle = getMockBundle(bundleId)
        
        // Calculate inventory as minimum of component stocks
        val componentStocks = bundle.items.associate { item ->
            item.productId to getMockStock(item.productId)
        }
        
        val availableStock = componentStocks.values.minOrNull() ?: 0
        
        return BundleInventory(
            bundleId = bundleId,
            availableStock = availableStock,
            componentStocks = componentStocks
        )
    }
    
    fun calculateBundlePricing(request: BundlePricingRequest): BundlePricingResponse {
        val bundle = getMockBundle(request.bundleId)
        
        // Calculate original price (sum of component prices)
        val originalPrice = bundle.items.sumOf { item ->
            getMockPrice(item.productId) * item.quantity
        }
        
        // Apply pricing strategy
        val discountedPrice = when (bundle.pricingStrategy) {
            BundlePricingStrategy.FIXED_PRICE -> bundle.pricingValue ?: originalPrice
            BundlePricingStrategy.PERCENTAGE_OFF -> originalPrice * (1 - (bundle.pricingValue ?: 0.0) / 100)
            BundlePricingStrategy.FLAT_DISCOUNT -> originalPrice - (bundle.pricingValue ?: 0.0)
            BundlePricingStrategy.CHEAPEST_FREE -> {
                val cheapestItemPrice = bundle.items.minOfOrNull { getMockPrice(it.productId) } ?: 0.0
                originalPrice - cheapestItemPrice
            }
        }
        
        val discount = originalPrice - discountedPrice
        val discountPercent = if (originalPrice > 0) (discount / originalPrice) * 100 else 0.0
        
        return BundlePricingResponse(
            bundleId = request.bundleId,
            originalPrice = originalPrice,
            discountedPrice = discountedPrice,
            discount = discount,
            discountPercent = discountPercent
        )
    }
    
    fun getMockBundle(bundleId: String): Bundle {
        // Mock implementation - in production, fetch from database
        return Bundle(
            id = bundleId,
            name = "Smartphone Combo",
            description = "Phone + Case + Earbuds bundle",
            bundleType = BundleType.COMBO,
            pricingStrategy = BundlePricingStrategy.PERCENTAGE_OFF,
            pricingValue = 10.0, // 10% off
            items = listOf(
                BundleItem(productId = "prod-1", quantity = 1),
                BundleItem(productId = "prod-2", quantity = 1),
                BundleItem(productId = "prod-3", quantity = 1)
            ),
            isActive = true,
            imageUrl = "https://example.com/bundle.jpg"
        )
    }
    
    private fun getMockStock(productId: String): Int {
        // Mock implementation - in production, fetch from inventory service
        return mapOf(
            "prod-1" to 50,
            "prod-2" to 30,
            "prod-3" to 25
        ).getOrDefault(productId, 0)
    }
    
    private fun getMockPrice(productId: String): Double {
        // Mock implementation - in production, fetch from pricing service
        return mapOf(
            "prod-1" to 15000.0,
            "prod-2" to 500.0,
            "prod-3" to 2000.0
        ).getOrDefault(productId, 0.0)
    }
}
