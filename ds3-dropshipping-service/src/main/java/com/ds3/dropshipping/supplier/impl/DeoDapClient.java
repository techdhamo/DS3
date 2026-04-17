package com.ds3.dropshipping.supplier.impl;

import com.ds3.dropshipping.supplier.interfaces.*;
import com.ds3.dropshipping.supplier.model.*;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * DeoDap Supplier Implementation
 * 
 * Concrete implementation of SupplierClient for DeoDap wholesale supplier.
 * This class demonstrates how to implement the supplier interfaces while
 * following SOLID principles.
 * 
 * Single Responsibility: Handles only DeoDap-specific logic
 * Open/Closed: Open for extension, closed for modification
 * Liskov Substitution: Can be substituted with any SupplierClient
 * Interface Segregation: Implements only required interfaces
 * Dependency Inversion: Depends on abstractions, not concretions
 */
@Slf4j
@Component
public class DeoDapClient implements SupplierClient {

    private SupplierConfig config;
    private final RestTemplate restTemplate;
    private boolean isInitialized = false;

    public DeoDapClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ===================
    // CONFIGURATION METHODS
    // ===================

    @Override
    public SupplierConfig getConfig() {
        return config;
    }

    @Override
    public void initialize(SupplierConfig config) {
        this.config = config;
        this.isInitialized = true;
        log.info("DeoDap client initialized for supplier: {}", config.getName());
    }

    @Override
    public CompletableFuture<Boolean> validateCredentials() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/auth/validate";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("apiKey", config.getApiKey());
                requestBody.put("apiSecret", config.getApiSecret());
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class
                );
                
                return response.getStatusCode().is2xxSuccessful();
            } catch (Exception e) {
                log.error("DeoDap credential validation failed", e);
                return false;
            }
        });
    }

    // ===================
    // INVENTORY METHODS
    // ===================

    @Override
    public CompletableFuture<List<SupplierProduct>> fetchAllProducts() {
        if (!isInitialized) {
            return CompletableFuture.failedFuture(
                new IllegalStateException("DeoDap client not initialized")
            );
        }

        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/products";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException("Failed to fetch products: " + response.getStatusCode());
                }

                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> products = (List<Map<String, Object>>) responseBody.get("products");
                
                return products.stream()
                    .map(this::transformDeoDapProduct)
                    .toList();
                    
            } catch (Exception e) {
                log.error("Failed to fetch DeoDap products", e);
                throw new RuntimeException("Failed to fetch products", e);
            }
        });
    }

    @Override
    public CompletableFuture<SupplierProduct> fetchProductBySku(String sku) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/products/" + sku;
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class
                );

                if (response.getStatusCode() == HttpStatus.NOT_FOUND) {
                    return null;
                }

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException("Failed to fetch product: " + response.getStatusCode());
                }

                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                Map<String, Object> productData = (Map<String, Object>) responseBody.get("product");
                
                return transformDeoDapProduct(productData);
                
            } catch (Exception e) {
                log.error("Failed to fetch DeoDap product {}", sku, e);
                throw new RuntimeException("Failed to fetch product", e);
            }
        });
    }

    @Override
    public CompletableFuture<Boolean> checkStockAvailability(String sku, int quantity) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/products/" + sku + "/stock";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("quantity", quantity);
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    return false;
                }

                Map<String, Object> responseBody = response.getBody();
                return Boolean.TRUE.equals(responseBody.get("available"));
                
            } catch (Exception e) {
                log.error("Failed to check stock for {}", sku, e);
                return false;
            }
        });
    }

    @Override
    public CompletableFuture<InventorySyncResult> syncInventory() {
        LocalDateTime startTime = LocalDateTime.now();
        
        InventorySyncResult.InventorySyncResultBuilder resultBuilder = InventorySyncResult.builder()
            .success(false)
            .productsSynced(0)
            .productsUpdated(0)
            .productsAdded(0)
            .errors(new ArrayList<>())
            .lastSyncAt(startTime)
            .supplierId(config.getId())
            .supplierName(config.getName());

        return fetchAllProducts()
            .thenApply(products -> {
                resultBuilder.productsSynced(products.size());
                resultBuilder.productsAdded(products.size()); // Simplified for now
                resultBuilder.success(true);
                return resultBuilder.build();
            })
            .exceptionally(throwable -> {
                resultBuilder.errors.add(throwable.getMessage());
                return resultBuilder.build();
            });
    }

    @Override
    public CompletableFuture<Boolean> testConnection() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/health";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
                );

                return response.getStatusCode().is2xxSuccessful();
                
            } catch (Exception e) {
                log.error("DeoDap connection test failed", e);
                return false;
            }
        });
    }

    // ===================
    // ORDER METHODS
    // ===================

    @Override
    public CompletableFuture<DropshipOrderResponse> placeOrder(DropshipOrderRequest orderRequest) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/orders";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                Map<String, Object> deoDapOrderRequest = transformOrderRequest(orderRequest);
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(deoDapOrderRequest, headers);
                
                ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException("Failed to place order: " + response.getStatusCode());
                }

                Map<String, Object> responseBody = response.getBody();
                
                return DropshipOrderResponse.builder()
                    .success(true)
                    .supplierOrderId((String) responseBody.get("orderId"))
                    .trackingNumber((String) responseBody.get("trackingNumber"))
                    .estimatedDelivery(parseDateTime((String) responseBody.get("estimatedDelivery")))
                    .totalAmount(parseBigDecimal(responseBody.get("totalAmount")))
                    .shippingCost(parseBigDecimal(responseBody.get("shippingCost")))
                    .errors(new ArrayList<>())
                    .build();
                    
            } catch (Exception e) {
                log.error("Failed to place DeoDap order", e);
                return DropshipOrderResponse.builder()
                    .success(false)
                    .totalAmount(java.math.BigDecimal.ZERO)
                    .shippingCost(java.math.BigDecimal.ZERO)
                    .errors(Arrays.asList(e.getMessage()))
                    .build();
            }
        });
    }

    @Override
    public CompletableFuture<OrderStatusResponse> getOrderStatus(String supplierOrderId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/orders/" + supplierOrderId + "/status";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException("Failed to get order status: " + response.getStatusCode());
                }

                Map<String, Object> responseBody = response.getBody();
                
                return OrderStatusResponse.builder()
                    .supplierOrderId(supplierOrderId)
                    .status((String) responseBody.get("status"))
                    .trackingNumber((String) responseBody.get("trackingNumber"))
                    .shippedAt(parseDateTime((String) responseBody.get("shippedAt")))
                    .deliveredAt(parseDateTime((String) responseBody.get("deliveredAt")))
                    .notes((String) responseBody.get("notes"))
                    .lastUpdated(LocalDateTime.now())
                    .build();
                    
            } catch (Exception e) {
                log.error("Failed to get status for order {}", supplierOrderId, e);
                throw new RuntimeException("Failed to get order status", e);
            }
        });
    }

    @Override
    public CompletableFuture<Boolean> cancelOrder(String supplierOrderId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = config.getBaseUrl() + "/orders/" + supplierOrderId + "/cancel";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(config.getApiKey());
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class
                );

                return response.getStatusCode().is2xxSuccessful();
                
            } catch (Exception e) {
                log.error("Failed to cancel order {}", supplierOrderId, e);
                return false;
            }
        });
    }

    @Override
    public CompletableFuture<String> getTrackingInfo(String supplierOrderId) {
        return getOrderStatus(supplierOrderId)
            .thenApply(status -> status.getTrackingNumber());
    }

    @Override
    public CompletableFuture<Boolean> testOrder() {
        DropshipOrderRequest testOrder = DropshipOrderRequest.builder()
            .items(Arrays.asList(
                OrderItem.builder()
                    .supplierSku("5119") // The hair accessory kit
                    .quantity(1)
                    .unitPrice(new java.math.BigDecimal("25.00"))
                    .build()
            ))
            .shippingAddress(ShippingAddress.builder()
                .name("Test Customer")
                .email("test@example.com")
                .phone("+919876543210")
                .addressLine1("123 Test Street")
                .city("Test City")
                .state("Test State")
                .postalCode("600001")
                .country("India")
                .build())
            .customerNotes("Test order - do not ship")
            .build();

        return placeOrder(testOrder)
            .thenApply(response -> response.isSuccess());
    }

    // ===================
    // PRIVATE HELPER METHODS
    // ===================

    private SupplierProduct transformDeoDapProduct(Map<String, Object> deoDapProduct) {
        return SupplierProduct.builder()
            .supplierSku(getString(deoDapProduct, "sku", "code"))
            .name(getString(deoDapProduct, "name"))
            .description(getString(deoDapProduct, "description"))
            .category(getString(deoDapProduct, "category"))
            .wholesalePrice(parseBigDecimal(deoDapProduct.get("wholesalePrice")))
            .retailPrice(parseBigDecimal(deoDapProduct.get("retailPrice")))
            .stockQuantity(parseInteger(deoDapProduct.get("stock", "quantity")))
            .minOrderQty(parseInteger(deoDapProduct.get("minOrderQty", "moq")))
            .weight(parseDouble(deoDapProduct.get("weight")))
            .dimensions(getString(deoDapProduct, "dimensions"))
            .imageUrl(getString(deoDapProduct, "imageUrl", "image"))
            .active(deoDapProduct.get("active") != null ? 
                !Boolean.FALSE.equals(deoDapProduct.get("active")) : true)
            .lastSyncAt(LocalDateTime.now())
            .build();
    }

    private Map<String, Object> transformOrderRequest(DropshipOrderRequest orderRequest) {
        Map<String, Object> request = new HashMap<>();
        
        List<Map<String, Object>> items = orderRequest.getItems().stream()
            .map(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("sku", item.getSupplierSku());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("price", item.getUnitPrice());
                return itemMap;
            })
            .toList();
        
        Map<String, Object> shippingAddress = new HashMap<>();
        shippingAddress.put("name", orderRequest.getShippingAddress().getName());
        shippingAddress.put("email", orderRequest.getShippingAddress().getEmail());
        shippingAddress.put("phone", orderRequest.getShippingAddress().getPhone());
        
        Map<String, Object> address = new HashMap<>();
        address.put("line1", orderRequest.getShippingAddress().getAddressLine1());
        address.put("line2", orderRequest.getShippingAddress().getAddressLine2());
        address.put("city", orderRequest.getShippingAddress().getCity());
        address.put("state", orderRequest.getShippingAddress().getState());
        address.put("postalCode", orderRequest.getShippingAddress().getPostalCode());
        address.put("country", orderRequest.getShippingAddress().getCountry());
        shippingAddress.put("address", address);
        
        request.put("items", items);
        request.put("shippingAddress", shippingAddress);
        request.put("notes", orderRequest.getCustomerNotes());
        request.put("dropship", true); // Explicitly mark as dropship order
        
        return request;
    }

    // Helper methods for data parsing
    private String getString(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }

    private java.math.BigDecimal parseBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return java.math.BigDecimal.valueOf(((Number) value).doubleValue());
        }
        try {
            return new java.math.BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDateTime parseDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime) {
            return (LocalDateTime) value;
        }
        try {
            return LocalDateTime.parse(value.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
