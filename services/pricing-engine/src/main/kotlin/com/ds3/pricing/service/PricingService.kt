package com.ds3.pricing.service

import com.ds3.pricing.model.*
import org.springframework.stereotype.Service

@Service
class PricingService {
    
    fun calculateCartPricing(request: CartPricingRequest): CartPricingResponse {
        val itemPricing = request.items.map { item ->
            calculateItemPricing(item)
        }
        
        val subtotal = itemPricing.sumOf { it.totalPrice }
        val totalDiscount = itemPricing.sumOf { it.discount }
        val total = subtotal - totalDiscount
        
        return CartPricingResponse(
            items = itemPricing,
            subtotal = subtotal,
            totalDiscount = totalDiscount,
            total = total,
            currency = request.currency
        )
    }
    
    private fun calculateItemPricing(item: CartItem): CartItemPricing {
        val appliedTier = determineTier(item)
        val unitPrice = appliedTier?.price ?: 0.0
        val totalPrice = unitPrice * item.quantity
        val discount = 0.0 // Calculate discount based on compareAtPrice
        val moqMet = appliedTier != null && item.quantity >= appliedTier.moq
        
        return CartItemPricing(
            productId = item.productId,
            quantity = item.quantity,
            unitPrice = unitPrice,
            totalPrice = totalPrice,
            appliedTier = appliedTier?.tierType,
            discount = discount,
            moqMet = moqMet
        )
    }
    
    private fun determineTier(item: CartItem): PricingTier? {
        // Mock implementation - in production, fetch from database
        val tiers = getMockTiers(item.productId)
        
        return tiers
            .filter { it.isActive }
            .filter { tier ->
                // Check customer type match
                when (item.customerType) {
                    CustomerType.RETAIL -> tier.tierType == TierType.RETAIL
                    CustomerType.WHOLESALE -> tier.tierType in listOf(TierType.SMALL_WHOLE, TierType.WHOLESALE, TierType.BULK)
                    CustomerType.PREMIUM -> true // Premium has access to all tiers
                }
            }
            .filter { tier ->
                // Check customer tags match
                tier.customerTags.isEmpty() || item.customerTags.any { it in tier.customerTags }
            }
            .filter { tier ->
                // Check MOQ
                item.quantity >= tier.moq
            }
            .minByOrNull { it.moq } // Get the lowest applicable tier
    }
    
    fun validateMoq(request: CartPricingRequest): MoqValidationResult {
        val violations = mutableListOf<MoqViolation>()
        
        request.items.forEach { item ->
            val tiers = getMockTiers(item.productId)
            val applicableTier = determineTier(item)
            
            if (applicableTier == null && tiers.isNotEmpty()) {
                // Find the minimum tier for this customer type
                val minTier = tiers
                    .filter { it.isActive }
                    .filter { tier ->
                        when (item.customerType) {
                            CustomerType.RETAIL -> tier.tierType == TierType.RETAIL
                            CustomerType.WHOLESALE -> tier.tierType in listOf(TierType.SMALL_WHOLE, TierType.WHOLESALE, TierType.BULK)
                            CustomerType.PREMIUM -> true
                        }
                    }
                    .minByOrNull { it.moq }
                
                if (minTier != null && item.quantity < minTier.moq) {
                    violations.add(MoqViolation(
                        productId = item.productId,
                        requiredQuantity = minTier.moq,
                        actualQuantity = item.quantity,
                        tierType = minTier.tierType
                    ))
                }
            }
        }
        
        return MoqValidationResult(
            isValid = violations.isEmpty(),
            violations = violations
        )
    }
    
    private fun getMockTiers(productId: String): List<PricingTier> {
        // Mock implementation - in production, fetch from database
        return listOf(
            PricingTier(
                id = "tier-1",
                productId = productId,
                tierType = TierType.RETAIL,
                moq = 1,
                price = 100.0
            ),
            PricingTier(
                id = "tier-2",
                productId = productId,
                tierType = TierType.SMALL_WHOLE,
                moq = 10,
                price = 90.0
            ),
            PricingTier(
                id = "tier-3",
                productId = productId,
                tierType = TierType.WHOLESALE,
                moq = 50,
                price = 80.0
            ),
            PricingTier(
                id = "tier-4",
                productId = productId,
                tierType = TierType.BULK,
                moq = 100,
                price = 70.0
            )
        )
    }
}
