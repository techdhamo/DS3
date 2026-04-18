package com.ds3.coupon.controller

import com.ds3.coupon.model.*
import com.ds3.coupon.service.CouponService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/coupons")
class CouponController(
    private val couponService: CouponService
) {
    
    @PostMapping("/validate")
    fun validateCoupon(@RequestBody request: CouponValidationRequest): ResponseEntity<CouponValidationResponse> {
        val response = couponService.validateCoupon(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/apply")
    fun applyCoupon(@RequestBody request: CouponApplicationRequest): ResponseEntity<CouponApplicationResponse> {
        val response = couponService.applyCoupon(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/create")
    fun createCoupon(@RequestBody request: CreateCouponRequest): ResponseEntity<Coupon> {
        val coupon = couponService.createCoupon(
            code = request.code,
            discountType = request.discountType,
            discountValue = request.discountValue,
            stackability = request.stackability,
            minOrderValue = request.minOrderValue,
            maxDiscountAmount = request.maxDiscountAmount,
            productIds = request.productIds,
            categoryIds = request.categoryIds,
            vendorIds = request.vendorIds,
            usageLimit = request.usageLimit
        )
        return ResponseEntity.ok(coupon)
    }
}

data class CreateCouponRequest(
    val code: String,
    val discountType: DiscountType,
    val discountValue: Double,
    val stackability: Stackability,
    val minOrderValue: Double?,
    val maxDiscountAmount: Double?,
    val productIds: List<String>?,
    val categoryIds: List<String>?,
    val vendorIds: List<String>?,
    val usageLimit: Int?
)
