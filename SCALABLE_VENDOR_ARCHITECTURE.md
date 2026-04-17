# Scalable Multi-Vendor E-Commerce Architecture
## Universal Commerce Protocol (UCP) - DS3 Store v2.0

**Document Version:** 2.0  
**Date:** April 17, 2026  
**Architect:** techdhamo <dhamodaran@outlook.in>  
**Repository:** https://github.com/techdhamo/DS3

---

## 🎯 Executive Summary

This document outlines the complete architecture for transforming DS3 Store into a **Universal Commerce Protocol (UCP)** - a multi-tenant, scalable e-commerce ecosystem supporting:

- ✅ **Multi-vendor management** (10+ Indian suppliers)
- ✅ **Async CSV/API ingestion** (Kafka/RabbitMQ)
- ✅ **Master catalog decoupling** (Global SKU ↔ Vendor Offer)
- ✅ **Wholesale & Retail** (B2B MOQ 50-100, B2C MOQ 1-5)
- ✅ **Real-time search** (PostgreSQL → Debezium → Kafka → Elasticsearch)
- ✅ **Virtual bundles & combos** (BOM-based inventory)
- ✅ **Coupon engine** (% off, flat rate, category-specific)
- ✅ **Vendor isolation** (pause stock without affecting master store)

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Web Store  │  │  Admin Dash  │  │  Vendor Portal│  │   Mobile Apps        │  │
│  │  (Next.js)   │  │  (React)     │  │  (React)      │  │   (React Native)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                  │                   │            │
└─────────┼──────────────────┼──────────────────┼───────────────────┼────────────┘
          │                  │                  │                   │
          └──────────────────┼──────────────────┘                   │
                             │ API Gateway (Kong/AWS API Gateway)  │
┌────────────────────────────┼──────────────────────────────────────────────────┐
│                         API LAYER                                               │
├────────────────────────────┼──────────────────────────────────────────────────┤
│  ┌─────────────────────────┴──────────────────────────────────────────────────┐  │
│  │                    Integration Adapter Service                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │
│  │  │ CSV API  │ │ Vendor   │ │ Product  │ │ Inventory│ │ Webhook  │           │  │
│  │  │ Upload   │ │ Auth     │ │ Import   │ │ Sync     │ │ Handler  │           │  │
│  │  └────┬─────┘ └──────────┘ └────┬─────┘ └──────────┘ └──────────┘           │  │
│  └───────┼─────────────────────────┼───────────────────────────────────────────┘  │
│          │                         │                                            │
│          ▼                         ▼                                            │
│  ┌──────────────────┐   ┌──────────────────┐                                     │
│  │  Message Queue   │   │  Validation      │                                     │
│  │  (Apache Kafka)  │   │  & Transform     │                                     │
│  │                  │   │                  │                                     │
│  │  Topics:         │   │  • Schema        │                                     │
│  │  • csv.uploads   │   │    validation    │                                     │
│  │  • product.import│   │  • Data          │                                     │
│  │  • price.updates │   │    cleansing     │                                     │
│  │  • stock.changes │   │  • Duplicate     │                                     │
│  └────────┬─────────┘   │    detection     │                                     │
│           │              └──────────────────┘                                     │
│           │                                                                      │
└───────────┼──────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      MASTER CATALOG (Global)                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │ global_      │  │ categories   │  │ attributes   │  │ media       │  │   │
│  │  │ products     │  │              │  │              │  │             │  │   │
│  │  │              │  │              │  │              │  │             │  │   │
│  │  │ • id (SKU)   │  │ • id         │  │ • id         │  │ • id        │  │   │
│  │  │ • title      │  │ • name       │  │ • name       │  │ • url       │  │   │
│  │  │ • desc       │  │ • slug       │  │ • type       │  │ • type      │  │   │
│  │  │ • brand      │  │ • parent_id  │  │ • values     │  │ • product_id│  │   │
│  │  │ • category_id│  │              │  │              │  │             │  │   │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  │         │                                                                 │   │
│  │         │  1:N                                                            │   │
│  │         ▼                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │   │
│  │  │                    VENDOR LAYER (Tenant Isolation)                 │  │   │
│  │  │                                                                     │  │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │   │
│  │  │  │ vendors      │  │ vendor_      │  │ vendor_      │             │  │   │
│  │  │  │              │  │ offers       │  │ pricing_     │             │  │   │
│  │  │  │ • id         │  │              │  │ tiers        │             │  │   │
│  │  │  │ • name       │  │ • id         │  │              │             │  │   │
│  │  │  │ • api_key    │  │ • global_    │  │ • id         │             │  │   │
│  │  │  │ • type       │  │   product_id │  │ • offer_id   │             │  │   │
│  │  │  │ • status     │  │ • vendor_id  │  │ • tier_type  │             │  │   │
│  │  │  │ • config     │  │ • vendor_sku│  │ • moq        │             │  │   │
│  │  │  │   (jsonb)    │  │ • price      │  │ • price      │             │  │   │
│  │  │  │              │  │ • stock      │  │ • currency   │             │  │   │
│  │  │  │              │  │ • status     │  │              │             │  │   │
│  │  │  │              │  │   (active/   │  │ TYPES:       │             │  │   │
│  │  │  │              │  │   hold/      │  │ • retail     │             │  │   │
│  │  │  │              │  │   stop)      │  │ • wholesale  │             │  │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │   │
│  │  │                                                                     │  │   │
│  │  │  KEY FEATURE: Vendor A can set status='hold' while Vendor B       │  │   │
│  │  │  continues selling the same GlobalProduct!                     │  │   │
│  │  └─────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │   │
│  │  │ virtual_     │  │ virtual_     │  │ virtual_     │                     │   │
│  │  │ bundles      │  │ bundle_      │  │ bundle_        │                     │   │
│  │  │              │  │ items        │  │ pricing      │                     │   │
│  │  │ • id         │  │              │  │              │                     │   │
│  │  │ • name       │  │ • bundle_id  │  │ • bundle_id    │                     │   │
│  │  │ • type       │  │ • product_id │  │ • tier_type    │                     │   │
│  │  │   (combo/    │  │ • quantity   │  │ • moq          │                     │   │
│  │  │    kit/      │  │              │  │ • price        │                     │   │
│  │  │    custom)   │  │ BOM Structure│  │                │                     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                     │   │
│  │                                                                           │   │
│  └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐     │
│  │                      PROMOTION ENGINE                                    │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │     │
│  │  │ coupons      │  │ coupon_      │  │ promotions   │                   │     │
│  │  │              │  │ rules        │  │              │                   │     │
│  │  │ • code       │  │              │  │ • id         │                   │     │
│  │  │ • type       │  │ • coupon_id  │  │ • name       │                   │     │
│  │  │   (%/flat)   │  │ • type       │  │ • type       │                   │     │
│  │  │ • value      │  │   (product/  │  │   (bxgy/     │                   │     │
│  │  │ • max_uses   │  │    category/ │  │    flash/    │                   │     │
│  │  │ • expiry     │  │    cart)     │  │    tiered)   │                   │     │
│  │  │              │  │ • conditions │  │              │                   │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                   │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
            │
            │ Change Data Capture (CDC)
            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    EVENT STREAMING (Apache Kafka + Debezium)                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                     │
│  │  Debezium    │────▶│  Kafka       │────▶│  Consumers   │                     │
│  │  Connector   │     │  Topics      │     │              │                     │
│  │              │     │              │     │  • Elastic   │                     │
│  │ Monitors:    │     │  • product   │     │    Search    │                     │
│  │ • INSERT     │     │    changes   │     │  • Cache     │                     │
│  │ • UPDATE     │     │  • price     │     │    Invalid.  │                     │
│  │ • DELETE     │     │    updates   │     │  • Analytics │                     │
│  │              │     │  • stock     │     │  • Webhook   │                     │
│  │ Real-time    │     │    changes   │     │    Notif.    │                     │
│  │ streaming    │     │  • vendor    │     │              │                     │
│  │              │     │    status    │     │              │                     │
│  └──────────────┘     └──────────────┘     └──────────────┘                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SEARCH LAYER (Elasticsearch)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Index: products-{tenant_id}                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  {                                                                       │   │
│  │    "id": "global_sku_123",                                              │   │
│  │    "title": "Premium Wireless Earbuds",                                 │   │
│  │    "description": "...",                                                  │   │
│  │    "category": { "id": "electronics", "name": "Electronics" },             │   │
│  │    "attributes": { "color": "black", "brand": "Sony" },                   │   │
│  │    "vendors": [                                                          │   │
│  │      {                                                                   │   │
│  │        "id": "vendor_a",                                                 │   │
│  │        "sku": "VEN-A-123",                                               │   │
│  │        "price": 1299.00,                                                 │   │
│  │        "stock": 50,                                                      │   │
│  │        "status": "active",                                               │   │
│  │        "pricing_tiers": [                                                │   │
│  │          { "type": "retail", "moq": 1, "price": 1299 },                  │   │
│  │          { "type": "wholesale", "moq": 50, "price": 999 }                 │   │
│  │        ]                                                                 │   │
│  │      },                                                                  │   │
│  │      {                                                                   │   │
│  │        "id": "vendor_b",                                                 │   │
│  │        "sku": "VEN-B-456",                                               │   │
│  │        "price": 1199.00,                                                 │   │
│  │        "stock": 0,                                                       │   │
│  │        "status": "hold",  ← Vendor B paused, but product still visible   │   │
│  │        "pricing_tiers": [...]                                            │   │
│  │      }                                                                   │   │
│  │    ],                                                                    │   │
│  │    "min_vendor_price": 1199,                                             │   │
│  │    "max_vendor_price": 1299,                                             │   │
│  │    "total_available_stock": 50,  ← Only Vendor A's stock                 │   │
│  │    "is_available": true,       ← Still available via Vendor A           │   │
│  │    "updated_at": "2026-04-17T10:00:00Z"                                   │   │
│  │  }                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Features:                                                                       │
│  • Sub-millisecond search latency                                                │
│  • Faceted search (category, price, brand)                                       │
│  • Real-time inventory updates                                                   │
│  • Vendor failover (auto-switch to next vendor)                                  │
│  • Price aggregation (min/max across vendors)                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Architectural Decisions

### 1. **Master Catalog vs. Vendor Inventory Decoupling**

```
GlobalProduct (Master SKU: "ELEC-EARBUDS-001")
├── Title: "Premium Wireless Earbuds"
├── Description: "High-quality audio..."
├── Category: Electronics > Audio
├── Images: [url1, url2, url3]
└── Vendors (1:N)
    ├── Vendor A Offer (SKU: "VEN-A-EB001")
    │   ├── Price: ₹1,299
    │   ├── Stock: 50 units
    │   ├── Status: ACTIVE ✅
    │   └── Pricing Tiers:
    │       ├── Retail: MOQ 1, Price ₹1,299
    │       └── Wholesale: MOQ 50, Price ₹999
    │
    └── Vendor B Offer (SKU: "VEN-B-WEB001")
        ├── Price: ₹1,199
        ├── Stock: 0 units
        ├── Status: HOLD ⏸️  ← Vendor paused
        └── Pricing Tiers: [...]
```

**Benefits:**
- Vendor A can pause without affecting Vendor B
- Master store shows product as available (via Vendor A)
- Can switch vendors dynamically based on stock/price
- Supports competitive pricing across vendors

---

### 2. **Async CSV Ingestion Pipeline**

```
Vendor Upload Flow
──────────────────
1. Vendor uploads CSV (100K products)
   ↓
2. API receives file, validates format
   ↓
3. File stored in S3, job ID returned (202 Accepted)
   ↓
4. Kafka message published to "csv.uploads" topic
   ↓
5. Worker service picks up message
   ↓
6. Streaming CSV parsing (row-by-row)
   ├─ Validate schema
   ├─ Check duplicates
   ├─ Transform data
   └─ Match to GlobalProduct or create new
   ↓
7. Batch insert to PostgreSQL (500 rows/batch)
   ↓
8. Debezium captures changes, streams to Kafka
   ↓
9. Elasticsearch index updated
   ↓
10. Webhook notification to vendor (completion/failures)
```

**Why Async?**
- API doesn't block during large uploads
- Can handle 100K+ products in minutes
- Retry logic for failed rows
- Progress tracking via job ID
- Parallel processing with multiple workers

---

### 3. **Wholesale vs. Retail Pricing Engine**

```typescript
// Pricing Tier Structure
interface PricingTier {
  id: string
  vendorOfferId: string
  type: 'retail' | 'wholesale' | 'b2b' | 'custom'
  moq: number              // Minimum Order Quantity
  price: number           // Price per unit
  currency: string
  maxQuantity?: number     // Optional tier cap
  volumeDiscounts?: {      // Tiered pricing
    quantity: number
    discountPercent: number
  }[]
}

// Example Vendor Offer with Tiers
{
  vendorId: "vendor_a",
  globalProductId: "ELEC-EARBUDS-001",
  pricingTiers: [
    { type: "retail", moq: 1, price: 1299 },      // B2C: Buy 1 at ₹1,299
    { type: "retail", moq: 2, price: 1249 },     // B2C: Buy 2 at ₹1,249 each
    { type: "wholesale", moq: 50, price: 999 },  // B2B: Buy 50 at ₹999 each
    { type: "wholesale", moq: 100, price: 899 }  // B2B: Buy 100 at ₹899 each
  ]
}

// Cart Validation Logic
function validateCart(cart: CartItem[], userType: 'retail' | 'wholesale'): boolean {
  for (const item of cart) {
    const applicableTier = item.product.pricingTiers
      .filter(t => t.type === userType)
      .find(t => item.quantity >= t.moq && 
                 (!t.maxQuantity || item.quantity <= t.maxQuantity))
    
    if (!applicableTier) {
      throw new Error(`MOQ not met. Minimum ${item.product.moq} for ${item.product.name}`)
    }
  }
  return true
}
```

---

### 4. **Virtual Bundles & Combos**

```
Virtual Bundle: "Premium Tech Combo"
├── Bundle ID: "BUNDLE-TECH-001"
├── Type: "combo"
├── Price: ₹4,999 (10% off individual prices)
├── Contains (BOM - Bill of Materials):
│   ├── Product A (Earbuds): Qty 1, Global SKU: "ELEC-EARBUDS-001"
│   ├── Product B (Power Bank): Qty 1, Global SKU: "ELEC-POWER-002"
│   └── Product C (Cable): Qty 2, Global SKU: "ELEC-CABLE-003"
├── Inventory Calculation:
│   └── min(
│         Vendor A Earbuds Stock: 50,
│         Vendor A Power Bank Stock: 30,
│         Vendor A Cable Stock / 2: 100/2 = 50
│       ) = 30 bundles available
└── Auto-disable when any component stock < 1
```

---

### 5. **Coupon Engine**

```
Coupon Types
────────────
1. PERCENTAGE_OFF
   - Code: "SAVE20"
   - Value: 20%
   - Max Discount: ₹500
   - Applicable: All products except Electronics

2. FLAT_RATE
   - Code: "FLAT500"
   - Value: ₹500 off
   - Min Cart Value: ₹2,000
   - Applicable: Category = Fashion

3. CATEGORY_SPECIFIC
   - Code: "ELEC10"
   - Value: 10% off
   - Applicable: Category IN ('electronics', 'gadgets')

4. BUY_X_GET_Y (BXGY)
   - Code: "B2G1"
   - Rule: Buy 2, Get 1 Free
   - Applicable: Same product only

5. TIERED_DISCOUNT
   - Cart ₹1,000: 5% off
   - Cart ₹2,500: 10% off
   - Cart ₹5,000: 15% off
```

---

## 🔌 Vendor Integration Matrix

| Vendor | Integration Type | API | CSV | Rate Limit | Priority |
|--------|-----------------|-----|-----|-----------|----------|
| **BaapStore** | API + CSV | ✅ REST | ✅ Auto | 1000 req/min | High |
| **Factori.com** | API | ✅ GraphQL | ❌ | 500 req/min | High |
| **Qikink** | API | ✅ REST | ❌ | 300 req/min | Medium |
| **Printrove** | API | ✅ REST | ❌ | 300 req/min | Medium |
| **IndiaMART** | API + Scraping | ✅ Enterprise | ⚠️ Manual | 100 req/min | Low |
| **DeoDap** | CSV | ❌ | ✅ Manual | N/A | Medium |
| **WholesaleBox** | CSV + API | ⚠️ Limited | ✅ Auto | 200 req/min | Medium |
| **Snazzyway** | CSV | ❌ | ✅ Auto | N/A | Low |
| **GlowRoad** | Scraping | ❌ | ❌ | N/A | Low |
| **Meesho** | Scraping | ❌ | ❌ | N/A | Low |

---

## 📋 Database Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- MASTER CATALOG (Global Products)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE global_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    short_description VARCHAR(1000),
    brand VARCHAR(100),
    category_id UUID NOT NULL REFERENCES categories(id),
    
    -- Product specs
    weight_grams INTEGER,
    dimensions_cm JSONB, -- {"l": 10, "w": 5, "h": 3}
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    slug VARCHAR(200) UNIQUE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'discontinued')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full-text search
    search_vector TSVECTOR
);

-- Categories (nested)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Attributes (EAV pattern for flexibility)
CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES global_products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(500) NOT NULL,
    display_type VARCHAR(20) DEFAULT 'text' -- text, color, image
);

-- Product Media
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES global_products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'image' CHECK (type IN ('image', 'video', '3d')),
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- VENDOR LAYER (Tenant Isolation)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- Short code like "BAAPSTORE", "DEODAP"
    
    -- Contact
    email VARCHAR(200),
    phone VARCHAR(20),
    address JSONB,
    
    -- Integration config
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('api', 'csv', 'manual', 'scraping')),
    api_config JSONB, -- { "base_url": "...", "auth_type": "api_key", ... }
    csv_config JSONB, -- { "format": "standard", "delimiter": ",", ... }
    
    -- Business rules
    default_shipping_days INTEGER DEFAULT 7,
    return_policy_days INTEGER DEFAULT 7,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Offers (The CRITICAL decoupling table)
CREATE TABLE vendor_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    global_product_id UUID NOT NULL REFERENCES global_products(id),
    
    -- Vendor's SKU
    vendor_sku VARCHAR(100) NOT NULL,
    
    -- Inventory
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hold', 'stop', 'out_of_stock')),
    -- active = selling normally
    -- hold = temporarily paused (vendor on vacation, quality issue)
    -- stop = permanently stopped
    -- out_of_stock = auto-set when stock hits 0
    
    -- Pricing (base price, tiers in separate table)
    base_price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2), -- MRP
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Sync tracking
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(20),
    sync_error_message TEXT,
    
    -- Metadata
    vendor_product_url TEXT,
    vendor_category VARCHAR(200),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(vendor_id, vendor_sku),
    UNIQUE(vendor_id, global_product_id)
);

-- Vendor Pricing Tiers (Wholesale vs Retail)
CREATE TABLE vendor_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_offer_id UUID NOT NULL REFERENCES vendor_offers(id) ON DELETE CASCADE,
    
    tier_type VARCHAR(20) NOT NULL CHECK (tier_type IN ('retail', 'wholesale', 'b2b', 'custom')),
    
    -- MOQ Rules
    minimum_quantity INTEGER NOT NULL DEFAULT 1,
    maximum_quantity INTEGER, -- NULL = unlimited
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Volume discounts (JSONB for flexibility)
    volume_discounts JSONB, -- [{"qty": 100, "discount_percent": 10}, ...]
    
    -- Restrictions
    customer_tags VARCHAR(50)[], -- ["wholesale", "premium"] - only these customer types
    valid_from DATE,
    valid_until DATE,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- VIRTUAL BUNDLES & COMBOS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE virtual_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    bundle_sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    
    bundle_type VARCHAR(20) NOT NULL CHECK (bundle_type IN ('combo', 'kit', 'custom', 'bxgy')),
    -- combo = fixed set of products
    -- kit = customizable within constraints
    -- custom = user builds their own
    -- bxgy = buy X get Y (promotional)
    
    -- Pricing strategy
    pricing_strategy VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_strategy IN ('fixed', 'dynamic', 'percentage_off')),
    fixed_price DECIMAL(10,2),
    percentage_off DECIMAL(5,2), -- e.g., 10.00 for 10%
    
    -- Display
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'discontinued')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle Items (BOM - Bill of Materials)
CREATE TABLE virtual_bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL REFERENCES virtual_bundles(id) ON DELETE CASCADE,
    
    -- Can link to global product OR be a placeholder for "user choice"
    global_product_id UUID REFERENCES global_products(id),
    
    quantity_required INTEGER NOT NULL DEFAULT 1,
    is_optional BOOLEAN DEFAULT false, -- Can user remove this item?
    
    -- For "user choice" slots (e.g., "Choose any 3 from Category X")
    category_constraint UUID REFERENCES categories(id),
    choice_group VARCHAR(50), -- Items with same group are alternatives
    
    sort_order INTEGER DEFAULT 0
);

-- Bundle Pricing Tiers (same structure as vendor_offers)
CREATE TABLE virtual_bundle_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL REFERENCES virtual_bundles(id) ON DELETE CASCADE,
    
    tier_type VARCHAR(20) NOT NULL CHECK (tier_type IN ('retail', 'wholesale', 'b2b')),
    minimum_quantity INTEGER NOT NULL DEFAULT 1,
    maximum_quantity INTEGER,
    unit_price DECIMAL(10,2) NOT NULL,
    
    is_active BOOLEAN DEFAULT true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COUPON ENGINE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(500),
    
    -- Discount type
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'flat_rate', 'free_shipping', 'bxgy')),
    discount_value DECIMAL(10,2), -- Percentage OR flat amount
    
    -- Limits
    max_discount_amount DECIMAL(10,2), -- For percentage coupons (e.g., max ₹500 off)
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    
    -- Usage limits
    max_uses_global INTEGER, -- NULL = unlimited
    max_uses_per_customer INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon Rules (applicability conditions)
CREATE TABLE coupon_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    
    rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN (
        'include_products', 'exclude_products',
        'include_categories', 'exclude_categories',
        'include_vendors', 'exclude_vendors',
        'customer_tags', 'first_order_only'
    )),
    
    rule_value UUID[], -- Array of product/category/vendor IDs
    
    is_inclusive BOOLEAN DEFAULT true -- true = include, false = exclude
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INGESTION & SYNC TRACKING
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('csv_upload', 'api_sync', 'manual')),
    
    -- Source
    source_url TEXT, -- S3 URL for CSV
    source_filename VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
    
    -- Stats
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    
    -- Error tracking
    error_log JSONB, -- [{"row": 123, "error": "Invalid SKU", ...}]
    
    -- Processing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processor_node VARCHAR(100), -- Which worker processed this
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Full-text search on products
CREATE INDEX idx_global_products_search ON global_products USING GIN(search_vector);

-- Vendor offer lookups
CREATE INDEX idx_vendor_offers_vendor ON vendor_offers(vendor_id);
CREATE INDEX idx_vendor_offers_product ON vendor_offers(global_product_id);
CREATE INDEX idx_vendor_offers_status ON vendor_offers(status) WHERE status = 'active';

-- Pricing tier lookups
CREATE INDEX idx_pricing_tiers_offer ON vendor_pricing_tiers(vendor_offer_id);
CREATE INDEX idx_pricing_tiers_type ON vendor_pricing_tiers(tier_type);

-- Category hierarchy
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Coupon lookups
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_validity ON coupons(valid_from, valid_until) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS FOR UPDATED_AT
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_global_products_updated_at BEFORE UPDATE ON global_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_offers_updated_at BEFORE UPDATE ON vendor_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔍 Elasticsearch Index Mapping

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "sku": { "type": "keyword" },
      
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      
      "description": { "type": "text", "analyzer": "standard" },
      
      "category": {
        "type": "object",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "slug": { "type": "keyword" },
          "parent_id": { "type": "keyword" }
        }
      },
      
      "brand": { "type": "keyword" },
      
      "attributes": {
        "type": "nested",
        "properties": {
          "name": { "type": "keyword" },
          "value": { "type": "keyword" }
        }
      },
      
      "vendors": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "sku": { "type": "keyword" },
          "price": { "type": "float" },
          "stock": { "type": "integer" },
          "status": { "type": "keyword" },
          "pricing_tiers": {
            "type": "nested",
            "properties": {
              "type": { "type": "keyword" },
              "moq": { "type": "integer" },
              "price": { "type": "float" }
            }
          }
        }
      },
      
      "pricing_summary": {
        "type": "object",
        "properties": {
          "min_price": { "type": "float" },
          "max_price": { "type": "float" },
          "compare_at_price": { "type": "float" },
          "currency": { "type": "keyword" }
        }
      },
      
      "inventory": {
        "type": "object",
        "properties": {
          "total_stock": { "type": "integer" },
          "available_vendors": { "type": "integer" },
          "is_available": { "type": "boolean" }
        }
      },
      
      "media": {
        "type": "nested",
        "properties": {
          "url": { "type": "keyword" },
          "type": { "type": "keyword" },
          "is_primary": { "type": "boolean" }
        }
      },
      
      "search_metadata": {
        "type": "object",
        "properties": {
          "popularity_score": { "type": "float" },
          "click_through_rate": { "type": "float" },
          "conversion_rate": { "type": "float" }
        }
      },
      
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  },
  
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "synonym_filter"]
        }
      },
      "filter": {
        "synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "mobile, phone, smartphone, cell",
            "laptop, notebook, computer",
            "earbuds, earphones, headphones"
          ]
        }
      }
    }
  }
}
```

---

## 🔧 Integration Adapter API Specification

### Base URL: `/api/v1/integration`

#### 1. CSV Upload Endpoint

```http
POST /vendors/{vendor_id}/upload
Content-Type: multipart/form-data

Request:
{
  "file": <CSV_FILE>,
  "options": {
    "skip_header": true,
    "encoding": "utf-8",
    "delimiter": ",",
    "batch_size": 500
  }
}

Response (202 Accepted):
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "CSV upload queued for processing",
  "webhook_url": "https://your-domain.com/webhooks/vendor/baapstore",
  "estimated_completion": "2026-04-17T15:30:00Z"
}

Response (200 OK - Webhook callback):
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "vendor_id": "baapstore",
  "status": "completed",
  "stats": {
    "total_rows": 15000,
    "success": 14750,
    "failed": 250,
    "new_products": 1200,
    "updated_products": 13550
  },
  "errors": [
    {
      "row": 1234,
      "sku": "INVALID-SKU",
      "error": "Price must be greater than 0"
    }
  ],
  "completed_at": "2026-04-17T15:28:45Z"
}
```

#### 2. Job Status Endpoint

```http
GET /jobs/{job_id}

Response:
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "vendor_id": "baapstore",
  "status": "processing",
  "progress": {
    "total": 15000,
    "processed": 7500,
    "percentage": 50
  },
  "started_at": "2026-04-17T15:00:00Z",
  "estimated_completion": "2026-04-17T15:30:00Z"
}
```

#### 3. Real-time Sync Trigger

```http
POST /vendors/{vendor_id}/sync

Request:
{
  "sync_type": "full" | "incremental" | "price_only" | "stock_only",
  "since": "2026-04-17T00:00:00Z",
  "webhook_url": "https://your-domain.com/webhooks/sync-complete"
}

Response (202 Accepted):
{
  "sync_id": "sync_abc123",
  "status": "started",
  "estimated_duration": "10 minutes"
}
```

#### 4. Vendor Configuration

```http
GET /vendors/{vendor_id}/config

Response:
{
  "vendor_id": "baapstore",
  "name": "BaapStore",
  "integration": {
    "type": "api",
    "api_version": "v2",
    "auth_type": "api_key",
    "base_url": "https://api.baapstore.com",
    "rate_limit": {
      "requests_per_minute": 1000,
      "burst_allowance": 100
    }
  },
  "sync_schedule": {
    "stock_sync": "every_15_minutes",
    "price_sync": "every_hour",
    "full_sync": "daily_at_02:00"
  },
  "mapping_rules": {
    "category_map": {
      "baapstore_electronics": "electronics",
      "baapstore_fashion": "fashion"
    },
    "field_mapping": {
      "product_name": "title",
      "mrp": "compare_at_price",
      "selling_price": "base_price"
    }
  }
}
```

---

## 🎯 Master Prompt for AI Code Generation

```
ROLE: Senior Backend Architect & Kotlin/Java Spring Boot Expert

OBJECTIVE: Design a scalable, multi-tenant e-commerce platform for the Indian 
dropshipping market with the following specific requirements:

CONTEXT: Building the "Universal Commerce Protocol (UCP)" - a system that handles:
1. Multi-vendor product ingestion via API and CSV
2. Decoupled Master Catalog (Global SKU) from Vendor Inventory (Vendor SKU)
3. Wholesale (B2B with MOQ 50-100) and Retail (B2C with MOQ 1-5) pricing tiers
4. Async processing via Apache Kafka
5. Real-time search via Elasticsearch with Debezium CDC
6. Virtual bundles/combos with BOM structure
7. Advanced coupon engine

REQUIREMENTS:

1. DATABASE SCHEMA (PostgreSQL):
   - Create tables for: global_products, categories, vendors, vendor_offers, 
     vendor_pricing_tiers, virtual_bundles, virtual_bundle_items, coupons, 
     coupon_rules, ingestion_jobs
   - Include proper foreign keys, indexes, constraints
   - Support soft deletes and audit trails
   - Include full-text search vectors
   - Use UUID primary keys

2. ELASTICSEARCH MAPPING:
   - Design index for "products" with nested vendors array
   - Support faceted search (category, price, brand)
   - Include pricing_tiers as nested objects
   - Enable auto-complete suggestions
   - Include inventory aggregation fields

3. KAFKA TOPICS:
   - Design topic structure for: product.import, price.update, stock.change, 
     vendor.status, bundle.update
   - Include message schemas (Avro/JSON)
   - Define partition keys for scalability

4. JAVA/KOTLIN MICROSERVICE:
   - Create Spring Boot application structure
   - Implement async CSV processor with Kafka producer
   - Implement vendor API client interface (for BaapStore, Factori, etc.)
   - Include retry logic, circuit breaker, rate limiting
   - Implement Debezium CDC consumer

5. REST API SPECIFICATION (OpenAPI):
   - /vendors/{id}/upload - CSV upload endpoint (async)
   - /vendors/{id}/sync - Trigger real-time sync
   - /jobs/{id} - Check job status
   - /vendors/{id}/config - Get vendor configuration
   - /products/search - Search with filters ( Elasticsearch)

DELIVERABLES FORMAT:
1. PlantUML or Mermaid ERD diagram
2. SQL DDL statements (PostgreSQL)
3. Elasticsearch index mapping (JSON)
4. Kafka topic configuration (YAML)
5. Java/Kotlin service classes with Spring annotations
6. OpenAPI 3.0 specification (YAML)

ADDITIONAL CONSTRAINTS:
- Use hexagonal architecture / ports and adapters pattern
- Include unit tests for critical paths
- Support multi-tenancy (tenant_id isolation)
- Include observability (metrics, tracing, logging)
- Design for 100K products per vendor, 50 vendors = 5M products
- Search latency must be < 50ms
- CSV ingestion must process 10K rows/minute
```

---

## 📈 Scalability Targets

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Products | 5 Million | ~500 | ⚠️ |
| Vendors | 50+ | 3 | ⚠️ |
| Search Latency | < 50ms | N/A | 🔴 |
| CSV Processing | 10K rows/min | Manual | 🔴 |
| Concurrent Users | 10,000 | ~100 | ⚠️ |
| Order Processing | 1000/min | ~10 | ⚠️ |

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up PostgreSQL with new schema
- [ ] Deploy Elasticsearch cluster
- [ ] Configure Kafka message queue
- [ ] Set up Debezium CDC

### Phase 2: Core Services (Weeks 3-4)
- [ ] Build Integration Adapter (Java/Kotlin)
- [ ] Implement CSV processor
- [ ] Build vendor API clients
- [ ] Create admin dashboard

### Phase 3: Search & Discovery (Weeks 5-6)
- [ ] Implement Elasticsearch indexing
- [ ] Build search API
- [ ] Create faceted navigation
- [ ] Implement auto-complete

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Virtual bundles engine
- [ ] Coupon system
- [ ] Wholesale/Retail pricing
- [ ] Vendor failover logic

### Phase 5: Integrations (Weeks 9-10)
- [ ] BaapStore integration
- [ ] Factori integration
- [ ] Qikink/Printrove integration
- [ ] IndiaMART scraping

---

## ✅ Success Criteria

1. **Vendor Independence**: Vendor A can pause stock without affecting Vendor B's listings or the Master Store
2. **Wholesale Support**: MOQ 50-100 enforced at cart/checkout
3. **Retail Flexibility**: MOQ 1-5 configurable per product
4. **Fast Search**: < 50ms response time for product search
5. **Scalable Ingestion**: Process 100K product CSV in < 10 minutes
6. **Real-time Updates**: Price/stock changes reflect in search within 1 second
7. **Bundle Support**: Create combos with automatic inventory calculation
8. **Coupon Engine**: Support % off, flat rate, category-specific, BXGY

---

**Document Version:** 2.0  
**Architecture Pattern:** Event-Driven Microservices  
**Target Scale:** 5M products, 50 vendors, 10K concurrent users  
**Author:** techdhamo <dhamodaran@outlook.in>
