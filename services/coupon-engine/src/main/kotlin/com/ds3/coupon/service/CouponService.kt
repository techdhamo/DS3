package com.ds3.coupon.service

import com.ds3.coupon.model.*
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CouponService {
    
    private val coupons = mutableMapOf<String, Coupon>()
    
    init {
        // Initialize with some mock coupons
        createCoupon(
            code = "SAVE10",
            discountType = DiscountType.PERCENTAGE_OFF,
            discountValue = 10.0,
            stackability = Stackability.STACKABLE
        )
        createCoupon(
            code = "FLAT500",
            discountType = DiscountType.FLAT_RATE,
            discountValue = 500.0,
            stackability = Stackability.NON_STACKABLE
        )
        createCoupon(
            code = "BXGY1",
            discountType = DiscountType.BXGY,
            discountValue = 0.0,
            stackability = Stackability.STACKABLE
        )
    }
    
    fun validateCoupon(request: CouponValidationRequest): CouponValidationResponse {
        val coupon = coupons[request.code.uppercase()]
        
        if (coupon == null) {
            return CouponValidationResponse(
                isValid = false,
                coupon = null,
                discount = 0.0,
                message = "Coupon code not found"
            )
        }
        
        if (!coupon.isActive) {
            return CouponValidationResponse(
                isValid = false,
                coupon = coupon,
                discount = 0.0,
                message = "Coupon is inactive"
            )
        }
        
        if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
            return CouponValidationResponse(
                isValid = false,
                coupon = coupon,
                discount = 0.0,
                message = "Coupon usage limit exceeded"
            )
        }
        
        if (coupon.minOrderValue != null && request.cartTotal < coupon.minOrderValue) {
            return CouponValidationResponse(
                isValid = false,
                coupon = coupon,
                discount = 0.0,
                message = "Minimum order value not met"
            )
        }
        
        // Check product/category/vendor filters
        if (!checkFilters(coupon, request)) {
            return CouponValidationResponse(
                isValid = false,
                coupon = coupon,
                discount = 0.0,
                message = "Coupon does not apply to these products"
            )
        }
        
        // Check stackability
        if (!checkStackability(coupon, request.appliedCoupons)) {
            return CouponValidationResponse(
                isValid = false,
                coupon = coupon,
                discount = 0.0,
                message = "Cannot stack with applied coupons"
            )
        }
        
        val discount = calculateDiscount(coupon, request.cartTotal)
        
        return CouponValidationResponse(
            isValid = true,
            coupon = coupon,
            discount = discount,
            message = "Coupon applied successfully"
        )
    }
    
    fun applyCoupon(request: CouponApplicationRequest): CouponApplicationResponse {
        val validation = validateCoupon(
            CouponValidationRequest(
                code = request.code,
                cartTotal = request.cartTotal,
                productIds = request.productIds,
                categoryIds = request.categoryIds,
                vendorIds = request.vendorIds,
                appliedCoupons = request.appliedCoupons
            )
        )
        
        if (!validation.isValid) {
            return CouponApplicationResponse(
                discount = 0.0,
                newTotal = request.cartTotal,
                appliedCoupons = request.appliedCoupons
            )
        }
        
        val coupon = validation.coupon!!
        val discount = validation.discount
        val newTotal = request.cartTotal - discount
        
        // Increment usage count
        coupon.usageCount++
        
        return CouponApplicationResponse(
            discount = discount,
            newTotal = newTotal,
            appliedCoupons = request.appliedCoupons + request.code.uppercase()
        )
    }
    
    fun createCoupon(
        code: String,
        discountType: DiscountType,
        discountValue: Double,
        stackability: Stackability,
        minOrderValue: Double? = null,
        maxDiscountAmount: Double? = null,
        productIds: List<String>? = null,
        categoryIds: List<String>? = null,
        vendorIds: List<String>? = null,
        usageLimit: Int? = null
    ): Coupon {
        val coupon = Coupon(
            id = UUID.randomUUID().toString(),
            code = code.uppercase(),
            discountType = discountType,
            discountValue = discountValue,
            stackability = stackability,
            minOrderValue = minOrderValue,
            maxDiscountAmount = maxDiscountAmount,
            productIds = productIds,
            categoryIds = categoryIds,
            vendorIds = vendorIds,
            usageLimit = usageLimit,
            validFrom = null,
            validUntil = null,
            isActive = true
        )
        
        coupons[coupon.code] = coupon
        return coupon
    }
    
    private fun checkFilters(coupon: Coupon, request: CouponValidationRequest): Boolean {
        // Check product filter
        if (coupon.productIds != null && coupon.productIds.isNotEmpty()) {
            if (!request.productIds.any { it in coupon.productIds }) {
                return false
            }
        }
        
        // Check category filter
        if (coupon.categoryIds != null && coupon.categoryIds.isNotEmpty()) {
            if (!request.categoryIds.any { it in coupon.categoryIds }) {
                return false
            }
        }
        
        // Check vendor filter
        if (coupon.vendorIds != null && coupon.vendorIds.isNotEmpty()) {
            if (!request.vendorIds.any { it in coupon.vendorIds }) {
                return false
            }
        }
        
        return true
    }
    
    private fun checkStackability(coupon: Coupon, appliedCoupons: List<String>): Boolean {
        if (appliedCoupons.isEmpty()) return true
        
        return when (coupon.stackability) {
            Stackability.STACKABLE -> true
            Stackability.NON_STACKABLE -> false
            Stackability.STACK_WITH_SAME -> {
                appliedCoupons.all { appliedCode ->
                    val appliedCoupon = coupons[appliedCode]
                    appliedCoupon?.discountType == coupon.discountType
                }
            }
        }
    }
    
    private fun calculateDiscount(coupon: Coupon, cartTotal: Double): Double {
        return when (coupon.discountType) {
            DiscountType.PERCENTAGE_OFF -> {
                val discount = cartTotal * (coupon.discountValue / 100)
                coupon.maxDiscountAmount?.let { minOf(discount, it) } ?: discount
            }
            DiscountType.FLAT_RATE -> {
                coupon.discountValue
            }
            DiscountType.BXGY -> {
                // BXGY logic - cheapest item free
                // For demo, return 0
                0.0
            }
            DiscountType.CATEGORY_SPECIFIC -> {
                // Category-specific discount
                // For demo, return percentage off
                val discount = cartTotal * (coupon.discountValue / 100)
                coupon.maxDiscountAmount?.let { minOf(discount, it) } ?: discount
            }
        }
    }
}
