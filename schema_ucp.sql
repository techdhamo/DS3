-- ═══════════════════════════════════════════════════════════════════════════════
-- DS3 UCP - Universal Commerce Protocol Database Schema
-- PostgreSQL 14+ 
-- Author: techdhamo <dhamodaran@outlook.in>
-- Version: 1.0.0
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For trigram search

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: CATEGORIES (Nested Hierarchy)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_categories_tenant ON categories(tenant_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: GLOBAL PRODUCTS (Master Catalog)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE global_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    -- Identification
    sku VARCHAR(100) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    
    -- Content
    title VARCHAR(500) NOT NULL,
    description TEXT,
    short_description VARCHAR(1000),
    
    -- Classification
    brand VARCHAR(100),
    category_id UUID REFERENCES categories(id),
    tags VARCHAR(100)[],
    
    -- Specifications
    weight_grams INTEGER,
    dimensions_cm JSONB, -- {"length": 10, "width": 5, "height": 3}
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    keywords VARCHAR(200)[],
    
    -- Search
    search_vector TSVECTOR,
    search_metadata JSONB DEFAULT '{}', -- popularity, click_rate, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'draft', 'discontinued', 'archived')),
    
    -- Audit
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(tenant_id, sku),
    UNIQUE(tenant_id, slug)
);

-- Indexes for global_products
CREATE INDEX idx_global_products_tenant ON global_products(tenant_id);
CREATE INDEX idx_global_products_category ON global_products(category_id);
CREATE INDEX idx_global_products_brand ON global_products(brand);
CREATE INDEX idx_global_products_status ON global_products(status);
CREATE INDEX idx_global_products_search ON global_products USING GIN(search_vector);
CREATE INDEX idx_global_products_tags ON global_products USING GIN(tags);
CREATE INDEX idx_global_products_created ON global_products(created_at DESC);

-- Trigram index for fuzzy search
CREATE INDEX idx_global_products_title_trgm ON global_products 
    USING GIN(title gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: PRODUCT ATTRIBUTES (EAV Pattern)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES global_products(id) ON DELETE CASCADE,
    
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(500) NOT NULL,
    attribute_type VARCHAR(20) DEFAULT 'text' 
        CHECK (attribute_type IN ('text', 'number', 'boolean', 'color', 'select')),
    display_order INTEGER DEFAULT 0,
    is_filterable BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, attribute_name)
);

CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX idx_product_attributes_name ON product_attributes(attribute_name);
CREATE INDEX idx_product_attributes_filterable ON product_attributes(is_filterable) 
    WHERE is_filterable = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: PRODUCT MEDIA
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES global_products(id) ON DELETE CASCADE,
    
    url TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'image' 
        CHECK (type IN ('image', 'video', 'document', '3d_model')),
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    file_size_bytes INTEGER,
    mime_type VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_media_product ON product_media(product_id);
CREATE INDEX idx_product_media_primary ON product_media(product_id, is_primary) 
    WHERE is_primary = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VENDOR LAYER: VENDORS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    -- Profile
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL, -- Short code: BAAPSTORE, DEODAP, etc.
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    
    -- Contact
    email VARCHAR(200),
    phone VARCHAR(20),
    address JSONB, -- {street, city, state, pincode, country}
    
    -- Integration
    integration_type VARCHAR(50) NOT NULL 
        CHECK (integration_type IN ('api', 'csv', 'manual', 'scraping')),
    api_config JSONB DEFAULT '{}', -- {base_url, auth_type, api_key, ...}
    csv_config JSONB DEFAULT '{}', -- {format, delimiter, mapping_rules, ...}
    webhook_url TEXT,
    
    -- Business Rules
    default_shipping_days INTEGER DEFAULT 7,
    return_policy_days INTEGER DEFAULT 7,
    payment_terms VARCHAR(50), -- Net 30, Net 60, etc.
    commission_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    
    -- Quality
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_orders INTEGER DEFAULT 0,
    successful_orders INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'suspended', 'inactive', 'blacklisted')),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_vendors_tenant ON vendors(tenant_id);
CREATE INDEX idx_vendors_code ON vendors(code);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_integration ON vendors(integration_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- VENDOR LAYER: VENDOR OFFERS (CRITICAL - Decoupling Table)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE vendor_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    -- Relationships
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    global_product_id UUID NOT NULL REFERENCES global_products(id),
    
    -- Vendor's SKU (can differ from global SKU)
    vendor_sku VARCHAR(100) NOT NULL,
    vendor_product_url TEXT, -- Link to vendor's product page
    vendor_category VARCHAR(200), -- Vendor's internal category
    
    -- Inventory
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- For pending orders
    available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
    low_stock_threshold INTEGER DEFAULT 10,
    
    -- Status (CRITICAL FEATURE)
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'hold', 'stop', 'out_of_stock', 'discontinued')),
    -- active = Selling normally
    -- hold = Temporarily paused (vendor vacation, quality issue)
    -- stop = Permanently stopped
    -- out_of_stock = Auto-set when stock hits 0
    -- discontinued = Vendor no longer carries this
    
    status_reason TEXT, -- Explanation for hold/stop
    status_changed_at TIMESTAMP WITH TIME ZONE,
    
    -- Pricing (Base price, detailed tiers in separate table)
    base_price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2), -- MRP/List price
    cost_price DECIMAL(10,2), -- For margin calculations
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Shipping
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    free_shipping_threshold DECIMAL(10,2),
    
    -- Sync Tracking
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(20) CHECK (last_sync_status IN ('success', 'failed', 'partial')),
    sync_error_count INTEGER DEFAULT 0,
    sync_error_message TEXT,
    
    -- Quality
    is_verified BOOLEAN DEFAULT false,
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(vendor_id, vendor_sku),
    UNIQUE(vendor_id, global_product_id)
);

-- Critical indexes for vendor_offers
CREATE INDEX idx_vendor_offers_vendor ON vendor_offers(vendor_id);
CREATE INDEX idx_vendor_offers_product ON vendor_offers(global_product_id);
CREATE INDEX idx_vendor_offers_status ON vendor_offers(status);
CREATE INDEX idx_vendor_offers_active ON vendor_offers(vendor_id, status) 
    WHERE status = 'active';
CREATE INDEX idx_vendor_offers_available ON vendor_offers(available_quantity, status) 
    WHERE status = 'active' AND available_quantity > 0;
CREATE INDEX idx_vendor_offers_tenant ON vendor_offers(tenant_id);
CREATE INDEX idx_vendor_offers_sync ON vendor_offers(last_sync_at);

-- Partial index for active offers only (optimization)
CREATE INDEX idx_vendor_offers_active_product ON vendor_offers(global_product_id, base_price) 
    WHERE status = 'active';

-- ═══════════════════════════════════════════════════════════════════════════════
-- VENDOR LAYER: PRICING TIERS (Wholesale vs Retail)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE vendor_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    vendor_offer_id UUID NOT NULL REFERENCES vendor_offers(id) ON DELETE CASCADE,
    
    -- Tier Definition
    tier_type VARCHAR(20) NOT NULL 
        CHECK (tier_type IN ('retail', 'wholesale', 'b2b', 'distributor', 'custom')),
    tier_name VARCHAR(100), -- e.g., "Gold Tier", "Enterprise"
    
    -- Quantity Rules
    minimum_quantity INTEGER NOT NULL DEFAULT 1, -- MOQ
    maximum_quantity INTEGER, -- NULL = unlimited
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Volume Discounts (JSONB for flexibility)
    volume_discounts JSONB DEFAULT '[]', 
    -- [{"min_qty": 100, "discount_percent": 5}, {"min_qty": 500, "discount_percent": 10}]
    
    -- Eligibility
    customer_tags VARCHAR(50)[], -- ["wholesale", "premium", "enterprise"]
    minimum_order_value DECIMAL(10,2),
    
    -- Validity
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher = evaluated first
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(vendor_offer_id, tier_type, minimum_quantity)
);

CREATE INDEX idx_pricing_tiers_offer ON vendor_pricing_tiers(vendor_offer_id);
CREATE INDEX idx_pricing_tiers_type ON vendor_pricing_tiers(tier_type);
CREATE INDEX idx_pricing_tiers_active ON vendor_pricing_tiers(is_active, valid_from, valid_until) 
    WHERE is_active = true;
CREATE INDEX idx_pricing_tiers_tenant ON vendor_pricing_tiers(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUNDLES: VIRTUAL BUNDLES (Combos, Kits)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE virtual_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    -- Identification
    bundle_sku VARCHAR(100) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    
    -- Content
    name VARCHAR(300) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Bundle Type
    bundle_type VARCHAR(20) NOT NULL 
        CHECK (bundle_type IN ('combo', 'kit', 'custom', 'bxgy', 'subscription')),
    -- combo = Fixed set of products ("Festive Combo")
    -- kit = Customizable within constraints ("Build Your Own")
    -- custom = User selects items ("Create Your Bundle")
    -- bxgy = Buy X Get Y ("Buy 2 Get 1 Free")
    -- subscription = Recurring bundle ("Monthly Essentials")
    
    -- Pricing Strategy
    pricing_strategy VARCHAR(20) DEFAULT 'fixed' 
        CHECK (pricing_strategy IN ('fixed', 'dynamic', 'percentage_off', 'amount_off')),
    fixed_price DECIMAL(10,2),
    percentage_off DECIMAL(5,2), -- e.g., 10.00 = 10% off total
    amount_off DECIMAL(10,2), -- e.g., 500 = ₹500 off total
    
    -- Constraints
    max_quantity_per_order INTEGER DEFAULT 10,
    min_order_value DECIMAL(10,2),
    
    -- Display
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Tags & SEO
    tags VARCHAR(100)[],
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'draft', 'discontinued')),
    
    -- Audit
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(tenant_id, bundle_sku),
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_virtual_bundles_tenant ON virtual_bundles(tenant_id);
CREATE INDEX idx_virtual_bundles_type ON virtual_bundles(bundle_type);
CREATE INDEX idx_virtual_bundles_status ON virtual_bundles(status);
CREATE INDEX idx_virtual_bundles_featured ON virtual_bundles(is_featured) WHERE is_featured = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUNDLES: BUNDLE ITEMS (BOM - Bill of Materials)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE virtual_bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    bundle_id UUID NOT NULL REFERENCES virtual_bundles(id) ON DELETE CASCADE,
    
    -- Product Reference (can be null for "user choice" slots)
    global_product_id UUID REFERENCES global_products(id),
    
    -- Quantity in bundle
    quantity_required INTEGER NOT NULL DEFAULT 1,
    is_optional BOOLEAN DEFAULT false, -- Can user remove this?
    
    -- Choice Constraints (for customizable bundles)
    choice_group VARCHAR(50), -- Items with same group are alternatives
    category_constraint UUID REFERENCES categories(id), -- "Any product from this category"
    brand_constraint VARCHAR(100), -- "Any product from this brand"
    price_min_constraint DECIMAL(10,2), -- "Product must cost at least X"
    price_max_constraint DECIMAL(10,2), -- "Product must cost at most X"
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    is_default_choice BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bundle_items_bundle ON virtual_bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product ON virtual_bundle_items(global_product_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUNDLES: BUNDLE PRICING TIERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE virtual_bundle_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    bundle_id UUID NOT NULL REFERENCES virtual_bundles(id) ON DELETE CASCADE,
    
    tier_type VARCHAR(20) NOT NULL 
        CHECK (tier_type IN ('retail', 'wholesale', 'b2b')),
    minimum_quantity INTEGER NOT NULL DEFAULT 1,
    maximum_quantity INTEGER,
    
    unit_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    volume_discounts JSONB DEFAULT '[]',
    
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bundle_pricing_bundle ON virtual_bundle_pricing_tiers(bundle_id);
CREATE INDEX idx_bundle_pricing_type ON virtual_bundle_pricing_tiers(tier_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COUPONS: COUPON ENGINE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    -- Identification
    code VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    
    -- Discount Type
    discount_type VARCHAR(20) NOT NULL 
        CHECK (discount_type IN ('percentage', 'flat_rate', 'free_shipping', 'bxgy', 'gift_card')),
    discount_value DECIMAL(10,2) NOT NULL, -- Percentage OR flat amount
    
    -- Limits
    max_discount_amount DECIMAL(10,2), -- For percentage coupons (e.g., max ₹500 off)
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    
    -- Usage Limits
    max_uses_global INTEGER, -- NULL = unlimited
    max_uses_per_customer INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    -- Customer Eligibility
    customer_tags VARCHAR(50)[], -- ["new", "vip", "wholesale"]
    exclude_customer_tags VARCHAR(50)[],
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Stackability
    is_stackable BOOLEAN DEFAULT false, -- Can combine with other coupons?
    stackable_with VARCHAR(50)[], -- Specific coupon codes this can stack with
    
    -- Display
    display_banner TEXT, -- Marketing text to show
    highlight_color VARCHAR(7), -- Hex color for UI
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_coupons_tenant ON coupons(tenant_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_validity ON coupons(is_active, valid_from, valid_until) 
    WHERE is_active = true;
CREATE INDEX idx_coupons_type ON coupons(discount_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COUPONS: COUPON RULES (Applicability Conditions)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE coupon_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    
    -- Rule Type
    rule_type VARCHAR(30) NOT NULL 
        CHECK (rule_type IN (
            'include_products', 'exclude_products',
            'include_categories', 'exclude_categories',
            'include_vendors', 'exclude_vendors',
            'include_brands', 'exclude_brands',
            'include_bundles', 'exclude_bundles',
            'customer_first_order', 'customer_min_lifetime_value',
            'payment_method', 'shipping_method'
        )),
    
    -- Rule Values (array of IDs or values)
    rule_values UUID[], -- For product/category/vendor IDs
    rule_string_values VARCHAR(100)[], -- For brands, payment methods, etc.
    
    -- Rule Logic
    is_inclusive BOOLEAN DEFAULT true, -- true = include, false = exclude
    min_matching_items INTEGER DEFAULT 1, -- For "buy X" rules
    
    -- Conditions
    condition_operator VARCHAR(10) DEFAULT 'AND' CHECK (condition_operator IN ('AND', 'OR')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_rules_coupon ON coupon_rules(coupon_id);
CREATE INDEX idx_coupon_rules_type ON coupon_rules(rule_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INGESTION: ASYNC JOB TRACKING
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    -- Job Definition
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    job_type VARCHAR(20) NOT NULL 
        CHECK (job_type IN ('csv_upload', 'api_sync', 'manual_import', 'price_sync', 'stock_sync')),
    job_name VARCHAR(200),
    
    -- Source
    source_type VARCHAR(20) CHECK (source_type IN ('s3', 'url', 'file_system', 'api')),
    source_url TEXT, -- S3 URL or file path
    source_filename VARCHAR(255),
    source_file_size_bytes BIGINT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'queued', 'processing', 'completed', 'failed', 'partial', 'cancelled')),
    
    -- Progress
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    progress_percentage INTEGER GENERATED ALWAYS AS 
        (CASE WHEN total_rows > 0 THEN (processed_rows * 100 / total_rows) ELSE 0 END) STORED,
    
    -- Error Tracking
    error_log JSONB DEFAULT '[]', -- [{"row": 123, "sku": "ABC", "error": "Invalid price", "severity": "error"}]
    warning_log JSONB DEFAULT '[]',
    
    -- Processing Metadata
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion_at TIMESTAMP WITH TIME ZONE,
    processing_duration_seconds INTEGER, -- Calculated on completion
    
    -- Worker Info
    processor_node VARCHAR(100), -- Hostname/container ID
    worker_thread VARCHAR(50),
    
    -- Webhook
    webhook_url TEXT,
    webhook_sent_at TIMESTAMP WITH TIME ZONE,
    webhook_response_status INTEGER,
    
    -- Options
    options JSONB DEFAULT '{}', -- {skip_header: true, encoding: "utf-8", ...}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ingestion_jobs_tenant ON ingestion_jobs(tenant_id);
CREATE INDEX idx_ingestion_jobs_vendor ON ingestion_jobs(vendor_id);
CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX idx_ingestion_jobs_type ON ingestion_jobs(job_type);
CREATE INDEX idx_ingestion_jobs_created ON ingestion_jobs(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ORDERS: ORDER MANAGEMENT (Simplified - Full schema separate)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    -- Order Info
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL, -- Reference to users table
    
    -- Financial
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending',
    
    -- Customer Type (for pricing tier selection)
    customer_type VARCHAR(20) DEFAULT 'retail' 
        CHECK (customer_type IN ('retail', 'wholesale', 'b2b', 'distributor')),
    
    -- Applied Coupons
    applied_coupons JSONB DEFAULT '[]', -- [{"code": "SAVE20", "discount": 500}]
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ORDER ITEMS (Linking to vendor offers)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Product Reference (snapshot at order time)
    global_product_id UUID REFERENCES global_products(id),
    vendor_offer_id UUID REFERENCES vendor_offers(id),
    
    -- Item Details
    product_name VARCHAR(500) NOT NULL, -- Snapshot
    vendor_sku VARCHAR(100) NOT NULL, -- Snapshot
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL, -- Price paid
    original_price DECIMAL(10,2), -- Before discount
    
    -- Vendor & Fulfillment
    vendor_id UUID REFERENCES vendors(id),
    fulfillment_status VARCHAR(20) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_vendor ON order_items(vendor_id);
CREATE INDEX idx_order_items_fulfillment ON order_items(fulfillment_status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_global_products_updated_at 
    BEFORE UPDATE ON global_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendor_offers_updated_at 
    BEFORE UPDATE ON vendor_offers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendor_pricing_tiers_updated_at 
    BEFORE UPDATE ON vendor_pricing_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_virtual_bundles_updated_at 
    BEFORE UPDATE ON virtual_bundles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_coupons_updated_at 
    BEFORE UPDATE ON coupons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ingestion_jobs_updated_at 
    BEFORE UPDATE ON ingestion_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full-text search vector update
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_global_products_search_vector
    BEFORE INSERT OR UPDATE ON global_products
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ═══════════════════════════════════════════════════════════════════════════════
-- VIEWS (For Common Queries)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Active products with best vendor price
CREATE VIEW v_products_best_price AS
SELECT 
    gp.id AS product_id,
    gp.sku,
    gp.title,
    gp.slug,
    gp.status AS product_status,
    MIN(vo.base_price) AS min_price,
    MAX(vo.base_price) AS max_price,
    COUNT(DISTINCT vo.vendor_id) AS vendor_count,
    SUM(CASE WHEN vo.status = 'active' AND vo.available_quantity > 0 THEN 1 ELSE 0 END) AS active_vendor_count,
    SUM(vo.available_quantity) AS total_available_stock
FROM global_products gp
LEFT JOIN vendor_offers vo ON gp.id = vo.global_product_id
WHERE gp.deleted_at IS NULL AND gp.status = 'active'
GROUP BY gp.id, gp.sku, gp.title, gp.slug, gp.status;

-- Vendor performance summary
CREATE VIEW v_vendor_performance AS
SELECT 
    v.id AS vendor_id,
    v.name AS vendor_name,
    v.code,
    COUNT(DISTINCT vo.global_product_id) AS total_products,
    SUM(CASE WHEN vo.status = 'active' THEN 1 ELSE 0 END) AS active_products,
    AVG(vo.quality_score) AS avg_quality_score,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    SUM(oi.quantity) AS total_items_sold
FROM vendors v
LEFT JOIN vendor_offers vo ON v.id = vo.vendor_id
LEFT JOIN order_items oi ON vo.id = oi.vendor_offer_id
WHERE v.deleted_at IS NULL
GROUP BY v.id, v.name, v.code;

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════════

-- Verify installation
SELECT 'Schema created successfully' AS status, 
       COUNT(*) AS table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
