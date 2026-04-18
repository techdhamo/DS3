package com.ds3.coupon.model

enum class DiscountType {
    PERCENTAGE_OFF,
    FLAT_RATE,
    BXGY,
    CATEGORY_SPECIFIC
}

enum class Stackability {
    STACKABLE,      // Can be combined with other coupons
    NON_STACKABLE,  // Cannot be combined
    STACK_WITH_SAME // Only stack with same type
}

data class Coupon(
    val id: String,
    val code: String,
    val discountType: DiscountType,
    val discountValue: Double,
    val stackability: Stackability,
    val minOrderValue: Double?,
    val maxDiscountAmount: Double?,
    val productIds: List<String>?,
    val categoryIds: List<String>?,
    val vendorIds: List<String>?,
    val usageLimit: Int?,
    val usageCount: Int = 0,
    val validFrom: String?,
    val validUntil: String?,
    val isActive: Boolean = true
)

data class CouponValidationRequest(
    val code: String,
    val cartTotal: Double,
    val productIds: List<String>,
    val categoryIds: List<String>,
    val vendorIds: List<String>,
    val appliedCoupons: List<String>
)

data class CouponValidationResponse(
    val isValid: Boolean,
    val coupon: Coupon?,
    val discount: Double,
    val message: String
)

data class CouponApplicationRequest(
    val code: String,
    val cartTotal: Double,
    val productIds: List<String>,
    val categoryIds: List<String>,
    val vendorIds: List<String>,
    val appliedCoupons: List<String>
)

data class CouponApplicationResponse(
    val discount: Double,
    val newTotal: Double,
    val appliedCoupons: List<String>
)
