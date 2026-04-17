# Identity Graph & Spatial Commerce Architecture
## DS3 UCP: Hyper-Personalization Engine

**Version:** 1.0 | **Author:** techdhamo <dhamodaran@outlook.in>

---

## 🎯 Executive Summary

This expands DS3 UCP to support **hyper-personalized spatial commerce** - capturing 1000+ biometric attributes for AI-generated product recommendations with AR/VR visualization.

### Core Innovation: The Identity Graph
Traditional e-commerce matches products to categories. **DS3 matches products to people** using 1000-dimensional Identity Vectors.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Web Store │ Mobile App │ AR/VR App │ Profile Manager      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   MICROSERVICES LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Identity Service (Node.js)                             │ │
│  │  • Master Account • Virtual Profiles • Delegated Links │ │
│  │  • Permission Engine                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Perception Engine (Python/FastAPI)                   │ │
│  │  • Photo Ingestion • AI Extraction • Vector Generator│ │
│  │  • MediaPipe • ResNet • CLIP                          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Matching Engine (Go)                                   │ │
│  │  • Vector Search • Similarity • Group Harmonizer      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Spatial Render (Node.js/WebXR)                       │ │
│  │  • Avatar Manager • Scene Composer • Generative Try-On│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL │ pgvector/Milvus │ Elasticsearch │ S3/MinIO   │
│  Redis      │ Kafka           │                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧬 Identity Graph Structure

```
Master Account (User)
├── Virtual Profiles
│   ├── Self (Mom)
│   │   ├── Biometric Vector (1000-dim)
│   │   ├── Privacy: {show_weight: false, show_size: true}
│   │   └── Avatar: avatar_mom.usdz
│   ├── Son (Rahul)
│   ├── Daughter
│   └── Father
│
└── Delegated Profiles (Linked Accounts)
    └── Friend (Priya)
        ├── Owner: user_friend_xyz
        └── Permissions: {can_view_size: true, can_view_weight: false}
```

---

## 🔬 Perception Engine: 1000+ Attributes

### Photo Ingestion Pipeline
```
1. Multi-Environment Capture
   ├── Front View (Face)
   ├── Side View (Profile)
   ├── Back View (Posture)
   └── Detail Shot (Hands)

2. AI Feature Extraction
   ├── MediaPipe: 468 facial landmarks
   ├── ResNet: Style classification
   ├── Custom CNN: Skin tone, BMI
   └── CLIP: Style preferences

3. Vector Generation (1000-dim)
   ├── Facial Geometry: 128-dim
   ├── Skin & Color: 64-dim
   ├── Body Metrics: 32-dim
   ├── Style Profile: 256-dim
   ├── Accessory Fit: 128-dim
   ├── Cosmetic Profile: 128-dim
   └── Behavioral: 256-dim (learned)

4. Avatar Generation
   └── USDZ/GLTF from ReadyPlayerMe
```

### Attribute Categories

| Category | Dimensions | Examples |
|----------|-----------|----------|
| Facial Geometry | 128 | Face shape, proportions, landmarks |
| Skin & Color | 64 | RGB tone, undertone, season palette |
| Body Metrics | 32 | Height, BMI, proportions, sizes |
| Style Profile | 256 | Aesthetic, colors, patterns, fit |
| Accessory Fit | 128 | Face width, wrist, finger sizes |
| Cosmetic Profile | 128 | Skin type, foundation matches |
| Behavioral | 256 | Click patterns, purchase history |

---

## 🎯 Matching Engine

### Vector Similarity Search
```
Input: User Vector (1000-dim) + Category Filter

Step 1: Filter by Category (ES)
       → 50,000 candidates

Step 2: Vector Search (pgvector)
       User: [0.23, 0.89, ..., 0.12]
       Product A: [0.25, 0.85, ...] → Cosine Sim: 0.94
       Product B: [0.30, 0.70, ...] → Cosine Sim: 0.87
       Time: <10ms for 1M products

Step 3: Multi-Objective Scoring
       Score = w1×Style + w2×Color + w3×Fit + w4×Price

Output: Ranked products with match scores
```

---

## 🥽 Spatial Commerce (AR/VR)

### Generative Try-On Pipeline
```
Input:
├── User Avatar (3D model)
├── Product Image (2D)
└── Placement Data (where on avatar)

Process:
1. Pose Extraction (MediaPipe)
2. Product Segmentation (SAM)
3. Context-Aware Placement
4. Stable Diffusion + ControlNet Inpainting
5. Physics Simulation (drape, fit)

Output:
├── Try-On Image (2D)
└── Textured 3D Model (USDZ/GLTF)
```

### Group Matching
```
Scenario: Family of 4 needs matching outfits

Step 1: Color Harmony Analysis
       Mom: Warm → Gold, Cream, Burgundy
       Dad: Cool → Navy, Silver, Charcoal
       Kids: Neutral bridge colors

Step 2: Coordinated Product Search
       Mom: Burgundy saree
       Dad: Navy sherwani
       Son: Cream kurta
       Daughter: Rose gold lehenga

Step 3: AR Visualization
       Render all 4 avatars together
       360° rotation
       Real-time lighting
```

---

## 🔐 Security & Privacy

### Biometric Data Protection
```
1. Encryption at Rest
   ├── Raw Photos: AES-256-GCM
   ├── Vectors: Encrypted in DB
   └── Keys: AWS KMS / HashiCorp Vault

2. Encryption in Transit
   ├── TLS 1.3 for APIs
   └── mTLS between services

3. Tenant Isolation
   ├── PostgreSQL RLS
   ├── tenant_id on ALL queries
   └── Separate vector collections

4. Data Minimization
   ├── Auto-delete photos after 30 days
   ├── Only vectors retained
   └── Photos never stored with PII

5. Granular Permissions
   ├── User controls visibility
   ├── Delegated profiles limited
   └── Audit all access

6. GDPR Compliance
   ├── Right to deletion
   ├── Right to export
   └── Differential privacy
```

### Permission Model
```typescript
interface Permissions {
  self: { canViewAll: true };
  
  virtualProfile: {
    parent: { canViewAll: true };
    child: { canViewLimited: true };
  };
  
  delegatedProfile: {
    owner: {
      canViewSize: boolean;
      canViewWeight: boolean; // Often false
      canOrderFor: boolean;
    };
  };
}
```

---

## 📊 Database Schema (PostgreSQL)

### Core Tables

```sql
-- Master Accounts
CREATE TABLE master_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(20),
    tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Virtual Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_account_id UUID REFERENCES master_accounts(id),
    
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(20), -- self, son, daughter, father, mother, friend
    
    -- Biometric metadata (stored in Vector DB)
    vector_id UUID, -- Reference to pgvector
    
    -- Avatar
    avatar_url_3d TEXT,
    avatar_format VARCHAR(10), -- usdz, gltf
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{
        "show_weight": false,
        "show_bmi": false,
        "show_size": true,
        "show_style": true,
        "show_photos": false
    }',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Delegated Profile Links
CREATE TABLE delegated_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- The delegator (who wants to buy)
    delegator_account_id UUID REFERENCES master_accounts(id),
    
    -- The owner (whose profile is linked)
    owner_account_id UUID REFERENCES master_accounts(id),
    owner_profile_id UUID REFERENCES profiles(id),
    
    -- Permissions granted
    permissions JSONB DEFAULT '{
        "can_view_size": true,
        "can_view_style": true,
        "can_view_weight": false,
        "can_view_bmi": false,
        "can_view_photos": false,
        "can_order_for": true,
        "requires_approval": false
    }',
    
    status VARCHAR(20) DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    
    UNIQUE(delegator_account_id, owner_profile_id)
);

-- Raw Photos (encrypted, auto-delete)
CREATE TABLE profile_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    
    photo_type VARCHAR(20), -- front, side, back, detail
    storage_url TEXT, -- S3 encrypted URL
    encryption_key_id VARCHAR(100),
    
    processed BOOLEAN DEFAULT false,
    vector_generated BOOLEAN DEFAULT false,
    
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    delete_after TIMESTAMP -- Auto-delete date
);

-- Biometric Attributes (extracted data)
CREATE TABLE biometric_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    
    category VARCHAR(50), -- facial, skin, body, style, accessory, cosmetic
    attribute_name VARCHAR(100),
    attribute_value JSONB, -- Flexible storage
    confidence_score DECIMAL(3,2), -- AI confidence
    
    extracted_at TIMESTAMP DEFAULT NOW(),
    model_version VARCHAR(20) -- Which AI model extracted this
);

-- Avatar Assets
CREATE TABLE avatar_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    
    asset_type VARCHAR(20), -- base, clothing, accessory
    format VARCHAR(10), -- usdz, gltf, fbx
    storage_url TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spatial Scenes
CREATE TABLE spatial_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_account_id UUID REFERENCES master_accounts(id),
    
    scene_name VARCHAR(200),
    scene_type VARCHAR(20), -- single, couple, group, family
    
    -- Participating profiles
    profile_ids UUID[],
    
    -- Recommended products for this scene
    recommended_products JSONB, -- [{profile_id, product_id, position}, ...]
    
    -- AR/VR data
    scene_data JSONB, -- Three.js/WebXR scene graph
    render_url TEXT, -- Pre-rendered scene URL
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matching History
CREATE TABLE matching_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    
    product_id UUID REFERENCES global_products(id),
    match_score DECIMAL(4,3), -- 0.000 to 1.000
    match_reasons JSONB, -- [{"factor": "color", "score": 0.95}, ...]
    
    user_feedback VARCHAR(20), -- loved, liked, neutral, disliked
    purchased BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_master ON profiles(master_account_id);
CREATE INDEX idx_profiles_vector ON profiles(vector_id);
CREATE INDEX idx_delegated_delegator ON delegated_links(delegator_account_id);
CREATE INDEX idx_delegated_owner ON delegated_links(owner_profile_id);
CREATE INDEX idx_photos_profile ON profile_photos(profile_id);
CREATE INDEX idx_photos_delete ON profile_photos(delete_after);
CREATE INDEX idx_biometric_profile ON biometric_attributes(profile_id);
CREATE INDEX idx_matching_profile ON matching_history(profile_id);
```

---

## 🔍 Vector Database Schema (pgvector)

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Identity Vectors (1000 dimensions)
CREATE TABLE identity_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    
    vector vector(1000), -- 1000-dimensional vector
    
    -- Vector components for debugging
    facial_segment vector(128),
    skin_segment vector(64),
    body_segment vector(32),
    style_segment vector(256),
    accessory_segment vector(128),
    cosmetic_segment vector(128),
    behavioral_segment vector(256),
    
    model_version VARCHAR(20),
    generated_at TIMESTAMP DEFAULT NOW(),
    
    -- HNSW index for fast ANN search
    CONSTRAINT unique_profile_vector UNIQUE (profile_id)
);

-- Product Vectors (same dimension for similarity)
CREATE TABLE product_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    global_product_id UUID REFERENCES global_products(id),
    
    vector vector(1000),
    
    -- Product-specific features
    color_vector vector(64),
    style_vector vector(256),
    fit_vector vector(128),
    occasion_vector vector(64),
    
    category VARCHAR(50),
    subcategory VARCHAR(50),
    
    model_version VARCHAR(20),
    generated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_product_vector UNIQUE (global_product_id)
);

-- HNSW Index for Approximate Nearest Neighbor Search
CREATE INDEX idx_identity_vectors_hnsw ON identity_vectors 
    USING hnsw (vector vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_product_vectors_hnsw ON product_vectors 
    USING hnsw (vector vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Category-specific indexes for filtering
CREATE INDEX idx_product_vectors_category ON product_vectors(category);

-- Similarity Search Query
-- Find top 10 matching products for a profile
/*
SELECT 
    p.global_product_id,
    p.vector <=> iv.vector AS distance,
    1 - (p.vector <=> iv.vector) AS similarity_score
FROM product_vectors p
CROSS JOIN identity_vectors iv
WHERE iv.profile_id = 'user-profile-uuid'
    AND p.category = 'jewelry'
ORDER BY p.vector <=> iv.vector
LIMIT 10;
*/
```

---

## 🚀 Implementation Roadmap

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Identity Foundation | Weeks 1-3 | Master Account, Profiles, Permissions |
| 2. Perception Engine | Weeks 4-6 | Photo ingestion, AI extraction, Vectors |
| 3. Vector DB | Weeks 7-8 | pgvector/Milvus, HNSW indexes |
| 4. Matching Engine | Weeks 9-10 | Similarity search, scoring |
| 5. Spatial Commerce | Weeks 11-13 | AR/VR, Generative try-on |
| 6. Security | Weeks 14-15 | Encryption, GDPR, Audit |

---

## ✅ Success Metrics

| Metric | Target |
|--------|--------|
| Profile Creation | < 5 min |
| Feature Extraction | < 30 sec |
| Recommendation Accuracy | > 85% |
| Search Latency | < 100ms |
| AR Generation | < 3 sec |
| User Adoption | > 60% |
| Conversion Lift | > 25% |

---

**Author:** techdhamo <dhamodaran@outlook.in>  
**Repository:** https://github.com/techdhamo/DS3
