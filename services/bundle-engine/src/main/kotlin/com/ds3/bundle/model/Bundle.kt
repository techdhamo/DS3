package com.ds3.bundle.model

enum class BundleType {
    COMBO,      // Fixed set of products
    KIT,        // Pre-assembled kit
    CUSTOM,     // User-customizable bundle
    BXGY        // Buy X Get Y
}

enum class BundlePricingStrategy {
    FIXED_PRICE,      // Bundle has fixed price
    PERCENTAGE_OFF,   // Percentage off total
    FLAT_DISCOUNT,    // Flat amount off total
    CHEAPEST_FREE     // Cheapest item free
}

data class Bundle(
    val id: String,
    val name: String,
    val description: String?,
    val bundleType: BundleType,
    val pricingStrategy: BundlePricingStrategy,
    val pricingValue: Double?, // Price or discount amount
    val items: List<BundleItem>,
    val isActive: Boolean = true,
    val imageUrl: String?,
    val minQuantity: Int = 1
)

data class BundleItem(
    val productId: String,
    val quantity: Int,
    val isOptional: Boolean = false,
    val minQuantity: Int = 1,
    val maxQuantity: Int = 1
)

data class BundleInventory(
    val bundleId: String,
    val availableStock: Int,
    val componentStocks: Map<String, Int> // productId -> available stock
)

data class BundlePricingRequest(
    val bundleId: String,
    val customItems: Map<String, Int>?, // For custom bundles: productId -> quantity
    val customerType: String = "RETAIL"
)

data class BundlePricingResponse(
    val bundleId: String,
    val originalPrice: Double,
    val discountedPrice: Double,
    val discount: Double,
    val discountPercent: Double,
    val currency: String = "INR"
)
