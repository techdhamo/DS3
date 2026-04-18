-- ═══════════════════════════════════════════════════════════════════════════════
-- DS3 Identity Graph Database Schema
-- PostgreSQL 14+ 
-- Author: techdhamo <dhamodaran@outlook.in>
-- Version: 1.0.0
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: MASTER ACCOUNTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE master_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    
    -- Account Settings
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_master_accounts_email ON master_accounts(email);
CREATE INDEX idx_master_accounts_phone ON master_accounts(phone);
CREATE INDEX idx_master_accounts_active ON master_accounts(is_active);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: PROFILES (Virtual/Delegated)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_account_id UUID NOT NULL REFERENCES master_accounts(id) ON DELETE CASCADE,
    
    -- Profile Identity
    display_name VARCHAR(100) NOT NULL,
    profile_type VARCHAR(20) NOT NULL DEFAULT 'virtual'
        CHECK (profile_type IN ('virtual', 'delegated')),
    
    -- Profile Settings
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(master_account_id, display_name)
);

CREATE INDEX idx_profiles_master_account ON profiles(master_account_id);
CREATE INDEX idx_profiles_type ON profiles(profile_type);
CREATE INDEX idx_profiles_primary ON profiles(is_primary) WHERE is_primary = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: DELEGATED LINKS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE delegated_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Link Parties
    owner_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    delegator_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Permissions (JSONB array of permission strings)
    permissions JSONB NOT NULL DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'revoked', 'expired')),
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_delegated_links_token ON delegated_links(token);
CREATE INDEX idx_delegated_links_owner ON delegated_links(owner_profile_id);
CREATE INDEX idx_delegated_links_delegator ON delegated_links(delegator_profile_id);
CREATE INDEX idx_delegated_links_status ON delegated_links(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: PROFILE PHOTOS (Encrypted)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE profile_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Photo Data (encrypted)
    photo_data BYTEA NOT NULL,
    encryption_key_id VARCHAR(255),
    
    -- Photo Metadata
    photo_type VARCHAR(20) NOT NULL
        CHECK (photo_type IN ('front', 'side', 'back', 'closeup')),
    file_size_bytes INTEGER,
    mime_type VARCHAR(100),
    
    -- Status
    is_primary BOOLEAN DEFAULT false,
    is_processed BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profile_photos_profile ON profile_photos(profile_id);
CREATE INDEX idx_profile_photos_type ON profile_photos(photo_type);
CREATE INDEX idx_profile_photos_primary ON profile_photos(profile_id, is_primary) WHERE is_primary = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: BIOMETRIC ATTRIBUTES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE biometric_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Body Measurements
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    bmi DECIMAL(5,2),
    body_shape VARCHAR(50),
    
    -- Skin Tone
    skin_tone VARCHAR(50),
    undertone VARCHAR(50),
    
    -- Face Features
    face_shape VARCHAR(50),
    face_landmarks JSONB, -- 468 landmarks from MediaPipe
    
    -- Style Preferences (CLIP embeddings)
    style_vector vector(512),
    
    -- Metadata
    measurement_source VARCHAR(50),
    confidence_score DECIMAL(3,2),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_biometric_attributes_profile ON biometric_attributes(profile_id);
CREATE INDEX idx_biometric_attributes_skin_tone ON biometric_attributes(skin_tone);
CREATE INDEX idx_biometric_attributes_body_shape ON biometric_attributes(body_shape);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: AVATAR ASSETS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE avatar_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Avatar Code
    avatar_code VARCHAR(100) UNIQUE NOT NULL,
    
    -- Asset URLs
    glb_url TEXT,
    gltf_url TEXT,
    usdz_url TEXT,
    preview_url TEXT,
    
    -- Avatar Metadata
    avatar_source VARCHAR(50), -- 'readymaker', 'custom'
    generation_config JSONB,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_avatar_assets_profile ON avatar_assets(profile_id);
CREATE INDEX idx_avatar_assets_code ON avatar_assets(avatar_code);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: SPATIAL SCENES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE spatial_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Scene Data
    scene_type VARCHAR(50) NOT NULL,
    scene_config JSONB,
    
    -- Scene Assets
    scene_url TEXT,
    thumbnail_url TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_spatial_scenes_profile ON spatial_scenes(profile_id);
CREATE INDEX idx_spatial_scenes_type ON spatial_scenes(scene_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE: MATCHING HISTORY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE matching_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    
    -- Match Data
    match_score DECIMAL(3,2),
    match_reason JSONB,
    
    -- Interaction
    interaction_type VARCHAR(50),
    feedback_score INTEGER,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matching_history_profile ON matching_history(profile_id);
CREATE INDEX idx_matching_history_product ON matching_history(product_id);
CREATE INDEX idx_matching_history_created ON matching_history(created_at DESC);
