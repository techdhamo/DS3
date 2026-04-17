# Master Prompt: Scalable Multi-Vendor E-Commerce Platform

**Use this prompt with any AI coding assistant (Claude, GPT-4, etc.) to generate the complete system.**

---

## 📋 THE MASTER PROMPT

**Copy and paste the following into your AI assistant:**

```
ROLE: You are a Senior Backend Architect and Kotlin/Java Spring Boot expert 
designing a high-performance, multi-vendor e-commerce platform for the Indian 
dropshipping market ("Universal Commerce Protocol" - UCP).

OBJECTIVE: Design the complete database schema (PostgreSQL), Elasticsearch mapping, 
Kafka architecture, and API specification for a system that ingests vendor data 
via API/CSV and manages a hybrid Retail/Wholesale catalog.

═══════════════════════════════════════════════════════════════════════════════

## CONTEXT & BUSINESS REQUIREMENTS

The DS3 Store is evolving into a Universal Commerce Protocol (UCP) that must:

1. SUPPORT 10 INDIAN DROPSHIPPING VENDORS:
   - BaapStore (150K SKUs, API + CSV)
   - Factori.com (Factory-direct, GraphQL API)
   - Qikink (Print-on-Demand, REST API)
   - Printrove (POD competitor, REST API)
   - IndiaMART (B2B directory, Enterprise API + scraping)
   - DeoDap (Household goods, CSV only)
   - WholesaleBox (Ethnic wear, CSV + API)
   - Snazzyway (Women's fashion, CSV)
   - GlowRoad (Amazon-owned, scraping)
   - Meesho (Volume leader, scraping)

2. HANDLE ASYNC CSV INGESTION:
   - Vendors upload CSV files with 10K-100K products
   - API must return 202 Accepted immediately
   - Process via Kafka message queue
   - Support real-time progress tracking
   - Validate, transform, and load to DB

3. MASTER CATALOG DECOUPLING (CRITICAL):
   - GlobalProduct = Master SKU (title, description, images)
   - VendorOffer = Vendor's SKU (price, stock, status)
   - One GlobalProduct can have multiple VendorOffers
   - If Vendor A sets status='hold', Vendor B continues selling
   - Master Store shows product as available if ANY vendor is active

4. WHOLESALE vs RETAIL PRICING:
   - Retail: MOQ 1-5, higher price per unit
   - Wholesale: MOQ 50-100, tiered volume discounts
   - PricingTiers attached to VendorOffer
   - Cart validation enforces MOQ per customer type

5. VIRTUAL BUNDLES & COMBOS:
   - Create "Virtual SKUs" that don't have physical inventory
   - Bill of Materials (BOM) links to physical Global SKUs
   - Inventory = min(stock of all components / qty needed)
   - Support percentage-off pricing for bundles

6. COUPON ENGINE:
   - Types: percentage_off, flat_rate, free_shipping, bxgy
   - Rules: include/exclude products, categories, vendors
   - Customer tags restrict coupon eligibility
   - Usage limits: global max, per-customer max

7. REAL-TIME SEARCH:
   - PostgreSQL → Debezium → Kafka → Elasticsearch
   - Sub-50ms search latency
   - Faceted search (category, price, brand, vendor)
   - Auto-complete suggestions
   - Price aggregation (min/max across vendors)

═══════════════════════════════════════════════════════════════════════════════

## DELIVERABLES REQUIRED

### 1. DATABASE SCHEMA (PostgreSQL)

Create SQL DDL for these tables with proper constraints, indexes, and relationships:

**Core Tables:**
- global_products (master catalog)
- categories (nested hierarchy)
- product_attributes (EAV pattern)
- product_media (images/videos)

**Vendor Layer:**
- vendors (vendor profiles)
- vendor_offers (decoupled inventory - CRITICAL)
- vendor_pricing_tiers (wholesale/retail)

**Bundles & Promotions:**
- virtual_bundles (combo definitions)
- virtual_bundle_items (BOM structure)
- virtual_bundle_pricing_tiers

**Coupon Engine:**
- coupons (discount codes)
- coupon_rules (applicability conditions)

**Ingestion:**
- ingestion_jobs (async processing tracking)

**Requirements:**
- Use UUID primary keys
- Include soft deletes (deleted_at)
- Add updated_at triggers
- Create GIN indexes for JSONB fields
- Add full-text search vectors
- Include foreign key constraints
- Support partitioning for large tables

### 2. ELASTICSEARCH MAPPING (JSON)

Create index mapping for "products" with:

**Properties:**
- id, sku (keyword)
- title (text with completion suggester, keyword subfield)
- description (text, analyzed)
- category (object: id, name, slug, parent_id)
- brand (keyword)
- attributes (nested: name, value)
- vendors (nested with pricing_tiers sub-nested)
  - id, sku, price, stock, status
  - pricing_tiers: type, moq, price
- pricing_summary (min_price, max_price, compare_at_price)
- inventory (total_stock, available_vendors, is_available)
- media (nested: url, type, is_primary)
- search_metadata (popularity_score, click_through_rate)
- created_at, updated_at (date)

**Settings:**
- 3 shards, 1 replica
- Custom analyzer with synonym filter
- Indian e-commerce synonyms (mobile/phone/smartphone)

### 3. KAFKA ARCHITECTURE

**Topics Design:**
- product.import (CSV upload events)
- price.update (price change events)
- stock.change (inventory updates)
- vendor.status (vendor offer status changes)
- bundle.update (virtual bundle changes)
- elasticsearch.sync (CDC events to ES)

**Configuration per topic:**
- Partition count (based on load)
- Replication factor
- Retention policy
- Message format (Avro/JSON schema)
- Producer/Consumer configs

### 4. JAVA/KOTLIN MICROSERVICE

Create Spring Boot 3.x application with:

**Project Structure:**
```
com.ds3.ucp/
├── adapter/
│   ├── in/
│   │   ├── web/ (REST controllers)
│   │   └── messaging/ (Kafka listeners)
│   └── out/
│       ├── persistence/ (JPA repositories)
│       ├── search/ (Elasticsearch client)
│       └── vendor/ (Vendor API clients)
├── application/
│   ├── port/
│   │   ├── in/ (Use cases)
│   │   └── out/ (SPI interfaces)
│   └── service/ (Business logic)
├── domain/
│   ├── model/ (Entities, Value Objects)
│   └── exception/ (Domain exceptions)
└── infrastructure/
    ├── config/
    └── util/
```

**Key Classes:**
- CsvUploadController (async upload endpoint)
- CsvProcessingService (Kafka consumer)
- VendorApiClient (interface for vendor integrations)
- BaapStoreClient (implementation)
- ProductSyncService (CDC handler)
- ElasticsearchIndexer (search indexing)
- PricingCalculator (wholesale/retail logic)

**Features:**
- Async processing with @Async and CompletableFuture
- Retry logic with Spring Retry
- Circuit breaker with Resilience4j
- Rate limiting with Bucket4j
- Validation with Bean Validation
- Caching with Caffeine

### 5. REST API SPECIFICATION (OpenAPI 3.0)

Define endpoints:

**Vendor Integration:**
```yaml
POST /vendors/{vendor_id}/upload
  - Multipart form data (CSV file)
  - Returns 202 Accepted with job_id
  
GET /jobs/{job_id}
  - Returns job status and progress
  
POST /vendors/{vendor_id}/sync
  - Trigger real-time sync
  - Options: full, incremental, price_only, stock_only
  
GET /vendors/{vendor_id}/config
  - Get vendor integration config
```

**Product Search:**
```yaml
GET /products/search
  - Query params: q, category, price_min, price_max, brand, vendor
  - Filters: in_stock, is_dropship, has_offer
  - Sort: relevance, price_asc, price_desc, newest
  - Pagination: page, limit
  - Response: hits, facets, aggregations
```

**Cart & Checkout:**
```yaml
POST /cart/validate
  - Validate MOQ rules
  - Check vendor stock availability
  - Apply pricing tiers based on customer type
```

### 6. ADDITIONAL REQUIREMENTS

**Architecture Pattern:**
- Hexagonal Architecture (Ports & Adapters)
- Domain-Driven Design (Aggregates, Entities, Value Objects)
- CQRS for read/write separation (optional)

**Observability:**
- Micrometer metrics (Prometheus)
- Distributed tracing (Zipkin/Jaeger)
- Structured logging (SLF4J + Logstash)
- Health checks (Spring Boot Actuator)

**Security:**
- JWT authentication
- API key for vendor webhooks
- Rate limiting per API key
- Input validation and sanitization

**Performance:**
- Connection pooling (HikariCP)
- Async database operations
- Bulk indexing to Elasticsearch
- Batch processing for CSV (500 rows/batch)

═══════════════════════════════════════════════════════════════════════════════

## OUTPUT FORMAT

Provide the following in order:

1. **Mermaid.js ERD Diagram** showing all table relationships
2. **SQL DDL Statements** (PostgreSQL 14+)
3. **Elasticsearch Mapping JSON**
4. **Kafka Topic Configuration YAML**
5. **Java/Kotlin Code** (Spring Boot 3.2+, Java 17+)
   - Main application class
   - Domain entities
   - Repository interfaces
   - Service implementations
   - REST controllers
   - Configuration classes
6. **OpenAPI 3.0 YAML** specification

═══════════════════════════════════════════════════════════════════════════════

## CONSTRAINTS & BOUNDARIES

**Scale Targets:**
- 5 Million products in catalog
- 50 active vendors
- 10,000 concurrent users
- 1000 orders per minute
- 50ms search latency p99
- 10K CSV rows processed per minute

**Tech Stack:**
- Java 17 or Kotlin 1.9
- Spring Boot 3.2+
- PostgreSQL 14+
- Elasticsearch 8.x
- Apache Kafka 3.x
- Debezium 2.x
- Docker & Kubernetes

**Must Include:**
- Unit tests (JUnit 5, Mockito)
- Integration tests (TestContainers)
- Database migrations (Flyway)
- API documentation (SpringDoc OpenAPI)

═══════════════════════════════════════════════════════════════════════════════

Do you understand the requirements? Please confirm and then provide the complete 
solution starting with the Mermaid ERD diagram, followed by SQL DDL, 
Elasticsearch mapping, Kafka config, Java/Kotlin code, and OpenAPI spec.
```

---

## 🎯 How to Use This Prompt

### Step 1: Prepare Your Environment
```bash
# Ensure you have access to:
- Claude 3.5 Sonnet or GPT-4 Turbo (or better)
- IDE with SQL, YAML, Java/Kotlin support
- PostgreSQL, Elasticsearch, Kafka (local or cloud)
```

### Step 2: Copy the Prompt
1. Copy the entire prompt above (between the triple backticks)
2. Paste into your AI assistant chat
3. Wait for confirmation of understanding

### Step 3: Review Outputs
The AI will generate:
1. **Mermaid ERD** - Visual diagram of database structure
2. **SQL DDL** - Ready-to-run PostgreSQL schema
3. **ES Mapping** - Elasticsearch index configuration
4. **Kafka Config** - Topic definitions and settings
5. **Java/Kotlin Code** - Complete microservice implementation
6. **OpenAPI Spec** - API documentation

### Step 4: Validate & Iterate
```bash
# Test the SQL
psql -d ds3_ucp -f schema.sql

# Test ES mapping
curl -X PUT "localhost:9200/products" -H 'Content-Type: application/json' -d @mapping.json

# Build the Java service
./mvnw clean install

# Run tests
./mvnw test
```

---

## 📚 Additional Context Documents

Reference these files in the DS3 repository:

1. **SCALABLE_VENDOR_ARCHITECTURE.md** - Complete architectural blueprint
2. **DESIGN_SYSTEM.md** - UI/UX design system
3. **ARCHITECTURE.md** - System architecture overview
4. **PROJECT_REVIEW_COMPLETE.md** - Code review findings

---

## 🔧 Post-Generation Tasks

After generating code with the AI:

### 1. Database Setup
```sql
-- Create database
CREATE DATABASE ds3_ucp;

-- Run migrations
psql -d ds3_ucp -f generated_schema.sql

-- Verify tables
\dt
```

### 2. Elasticsearch Setup
```bash
# Create index
curl -X PUT "localhost:9200/products" \
  -H 'Content-Type: application/json' \
  -d @generated_mapping.json

# Verify mapping
curl "localhost:9200/products/_mapping"
```

### 3. Kafka Setup
```bash
# Create topics
kafka-topics.sh --create --topic product.import --partitions 6 --replication-factor 1
kafka-topics.sh --create --topic price.update --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic stock.change --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic elasticsearch.sync --partitions 6 --replication-factor 1
```

### 4. Java Service Deployment
```bash
# Build
cd ucp-integration-service
./mvnw clean package

# Dockerize
docker build -t ds3/ucp-integration:latest .

# Deploy to Kubernetes
kubectl apply -f k8s/
```

---

## ✅ Success Criteria

The generated code must satisfy:

- [ ] **Vendor Independence**: One vendor can pause without affecting others
- [ ] **Wholesale Support**: MOQ 50-100 enforced at API level
- [ ] **Retail Flexibility**: MOQ 1-5 per product configurable
- [ ] **Async Processing**: CSV upload returns immediately, processes in background
- [ ] **Fast Search**: < 50ms query latency to Elasticsearch
- [ ] **Real-time Sync**: DB changes reflect in search within 1 second
- [ ] **Bundle Support**: BOM-based inventory calculation works
- [ ] **Coupon Engine**: All discount types supported
- [ ] **Test Coverage**: > 80% unit test coverage
- [ ] **Documentation**: OpenAPI spec is complete and accurate

---

## 🚀 Next Steps After Generation

1. **Review & Refine**: Have the AI explain any complex sections
2. **Add Tests**: Generate unit and integration tests
3. **Security Audit**: Add authentication, authorization
4. **Performance Tuning**: Optimize queries and indexes
5. **Monitoring**: Add metrics, logging, alerting
6. **Load Testing**: Use k6 or JMeter to test at scale

---

**Prompt Version:** 1.0  
**Target AI:** Claude 3.5 Sonnet, GPT-4 Turbo, or equivalent  
**Author:** techdhamo <dhamodaran@outlook.in>  
**License:** MIT
