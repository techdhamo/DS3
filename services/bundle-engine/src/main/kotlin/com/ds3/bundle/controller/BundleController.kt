package com.ds3.bundle.controller

import com.ds3.bundle.model.*
import com.ds3.bundle.service.BundleService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/bundles")
class BundleController(
    private val bundleService: BundleService
) {
    
    @GetMapping("/{bundleId}/inventory")
    fun getBundleInventory(@PathVariable bundleId: String): ResponseEntity<BundleInventory> {
        val inventory = bundleService.calculateBundleInventory(bundleId)
        return ResponseEntity.ok(inventory)
    }
    
    @PostMapping("/pricing")
    fun calculateBundlePricing(@RequestBody request: BundlePricingRequest): ResponseEntity<BundlePricingResponse> {
        val pricing = bundleService.calculateBundlePricing(request)
        return ResponseEntity.ok(pricing)
    }
    
    @GetMapping("/{bundleId}")
    fun getBundle(@PathVariable bundleId: String): ResponseEntity<Bundle> {
        val bundle = bundleService.getMockBundle(bundleId)
        return ResponseEntity.ok(bundle)
    }
}
