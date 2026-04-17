-- DS3 Identity Graph - Vector Database Schema (Part 3)
-- Requires pgvector extension: CREATE EXTENSION vector;

-- Identity Vectors (1000 dimensions)
CREATE TABLE identity_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Full 1000-dimensional vector
    vector vector(1000),
    
    -- Segmented vectors for partial matching
    facial_segment vector(128),
    skin_segment vector(64),
    body_segment vector(32),
    style_segment vector(256),
    accessory_segment vector(128),
    cosmetic_segment vector(128),
    behavioral_segment vector(256),
    
    model_version VARCHAR(20),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(profile_id)
);

-- Product Vectors (1000 dimensions)
CREATE TABLE product_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    global_product_id UUID NOT NULL,
    
    vector vector(1000),
    color_vector vector(64),
    style_vector vector(256),
    fit_vector vector(128),
    occasion_vector vector(64),
    material_vector vector(64),
    price_vector vector(64),
    season_vector vector(32),
    brand_vector vector(128),
    gender_vector vector(32),
    age_vector vector(32),
    
    category VARCHAR(50),
    subcategory VARCHAR(50),
    model_version VARCHAR(20),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(global_product_id)
);

-- HNSW Index for fast Approximate Nearest Neighbor Search
CREATE INDEX idx_identity_vectors_hnsw ON identity_vectors 
    USING hnsw (vector vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_product_vectors_hnsw ON product_vectors 
    USING hnsw (vector vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Category indexes for pre-filtering
CREATE INDEX idx_product_vectors_category ON product_vectors(category);
CREATE INDEX idx_identity_vectors_profile ON identity_vectors(profile_id);

-- Similarity search queries
-- Find top 10 matching products for a profile
-- SELECT p.global_product_id, 1 - (p.vector <=> iv.vector) AS similarity
-- FROM product_vectors p
-- CROSS JOIN identity_vectors iv
-- WHERE iv.profile_id = 'uuid' AND p.category = 'jewelry'
-- ORDER BY p.vector <=> iv.vector
-- LIMIT 10;
