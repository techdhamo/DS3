package com.ds3.pricing.controller

import com.ds3.pricing.model.*
import com.ds3.pricing.service.PricingService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/pricing")
class PricingController(
    private val pricingService: PricingService
) {
    
    @PostMapping("/calculate")
    fun calculateCartPricing(@RequestBody request: CartPricingRequest): ResponseEntity<CartPricingResponse> {
        val result = pricingService.calculateCartPricing(request)
        return ResponseEntity.ok(result)
    }
    
    @PostMapping("/validate-moq")
    fun validateMoq(@RequestBody request: CartPricingRequest): ResponseEntity<MoqValidationResult> {
        val result = pricingService.validateMoq(request)
        return ResponseEntity.ok(result)
    }
    
    @GetMapping("/tiers/{productId}")
    fun getProductTiers(@PathVariable productId: String): ResponseEntity<List<TierType>> {
        // Return available tier types for a product
        return ResponseEntity.ok(listOf(
            TierType.RETAIL,
            TierType.SMALL_WHOLE,
            TierType.WHOLESALE,
            TierType.BULK
        ))
    }
}
