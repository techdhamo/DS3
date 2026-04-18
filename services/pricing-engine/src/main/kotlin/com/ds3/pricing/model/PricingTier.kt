package com.ds3.pricing.model

enum class CustomerType {
    RETAIL,
    WHOLESALE,
    PREMIUM
}

enum class TierType {
    RETAIL,      // MOQ 1-5
    SMALL_WHOLE, // MOQ 10-25
    WHOLESALE,   // MOQ 50-100
    BULK         // MOQ 100+
}

data class PricingTier(
    val id: String,
    val productId: String,
    val tierType: TierType,
    val moq: Int,
    val price: Double,
    val currency: String = "INR",
    val customerTags: List<String> = emptyList(),
    val isActive: Boolean = true
)

data class ProductPricing(
    val productId: String,
    val basePrice: Double,
    val compareAtPrice: Double?,
    val tiers: List<PricingTier>,
    val currency: String = "INR"
)

data class CartItem(
    val productId: String,
    val quantity: Int,
    val customerType: CustomerType,
    val customerTags: List<String> = emptyList()
)

data class CartPricingRequest(
    val items: List<CartItem>,
    val currency: String = "INR"
)

data class CartPricingResponse(
    val items: List<CartItemPricing>,
    val subtotal: Double,
    val totalDiscount: Double,
    val total: Double,
    val currency: String
)

data class CartItemPricing(
    val productId: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double,
    val appliedTier: TierType?,
    val discount: Double,
    val moqMet: Boolean
)

data class MoqValidationResult(
    val isValid: Boolean,
    val violations: List<MoqViolation>
)

data class MoqViolation(
    val productId: String,
    val requiredQuantity: Int,
    val actualQuantity: Int,
    val tierType: TierType
)
