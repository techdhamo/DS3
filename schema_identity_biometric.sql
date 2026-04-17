-- DS3 Identity Graph - Biometric & Spatial Schema (Part 2)
-- Biometric Attributes, Avatar Assets, Spatial Scenes, Matching History

-- Biometric Attributes
CREATE TABLE biometric_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_display_name VARCHAR(200),
    attribute_value JSONB NOT NULL,
    data_type VARCHAR(20),
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    extracted_from_photo_id UUID,
    extraction_method VARCHAR(50),
    model_version VARCHAR(20),
    is_sensitive BOOLEAN DEFAULT false,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, attribute_name)
);

CREATE INDEX idx_biometric_profile ON biometric_attributes(profile_id);
CREATE INDEX idx_biometric_category ON biometric_attributes(category);
CREATE INDEX idx_biometric_name ON biometric_attributes(attribute_name);
CREATE INDEX idx_biometric_confidence ON biometric_attributes(confidence_score);
CREATE INDEX idx_biometric_tenant ON biometric_attributes(tenant_id);
CREATE INDEX idx_biometric_value ON biometric_attributes USING GIN(attribute_value);

-- Avatar Assets
CREATE TABLE avatar_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    asset_type VARCHAR(20) NOT NULL,
    format VARCHAR(10) NOT NULL,
    storage_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    generated_by VARCHAR(50),
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    quality_score DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_avatar_profile ON avatar_assets(profile_id);
CREATE INDEX idx_avatar_type ON avatar_assets(asset_type);
CREATE INDEX idx_avatar_current ON avatar_assets(profile_id, is_current) WHERE is_current = true;
CREATE INDEX idx_avatar_tenant ON avatar_assets(tenant_id);

-- Spatial Scenes
CREATE TABLE spatial_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    master_account_id UUID NOT NULL REFERENCES master_accounts(id) ON DELETE CASCADE,
    scene_name VARCHAR(200) NOT NULL,
    scene_type VARCHAR(20) NOT NULL,
    background_type VARCHAR(20) DEFAULT 'studio',
    participant_profile_ids UUID[] NOT NULL,
    products_in_scene JSONB DEFAULT '[]'::jsonb,
    scene_data JSONB,
    preview_image_url TEXT,
    ar_compatible BOOLEAN DEFAULT false,
    vr_compatible BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rendered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_scenes_master ON spatial_scenes(master_account_id);
CREATE INDEX idx_scenes_type ON spatial_scenes(scene_type);
CREATE INDEX idx_scenes_status ON spatial_scenes(status);
CREATE INDEX idx_scenes_share ON spatial_scenes(share_token) WHERE is_public = true;
CREATE INDEX idx_scenes_tenant ON spatial_scenes(tenant_id);
CREATE INDEX idx_scenes_products ON spatial_scenes USING GIN(products_in_scene);

-- Matching History
CREATE TABLE matching_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    global_product_id UUID,
    match_score DECIMAL(4,3) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
    match_reasons JSONB DEFAULT '[]'::jsonb,
    user_feedback VARCHAR(20),
    feedback_at TIMESTAMP WITH TIME ZONE,
    viewed_in_ar BOOLEAN DEFAULT false,
    added_to_cart BOOLEAN DEFAULT false,
    purchased BOOLEAN DEFAULT false,
    recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_matching_profile ON matching_history(profile_id);
CREATE INDEX idx_matching_product ON matching_history(global_product_id);
CREATE INDEX idx_matching_score ON matching_history(match_score);
CREATE INDEX idx_matching_feedback ON matching_history(user_feedback) WHERE user_feedback IS NOT NULL;
CREATE INDEX idx_matching_purchased ON matching_history(purchased) WHERE purchased = true;
CREATE INDEX idx_matching_tenant ON matching_history(tenant_id);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    actor_type VARCHAR(20) NOT NULL,
    actor_id UUID,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    profile_id UUID,
    is_sensitive_access BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_profile ON audit_logs(profile_id);
CREATE INDEX idx_audit_sensitive ON audit_logs(is_sensitive_access) WHERE is_sensitive_access = true;
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);

-- Triggers
CREATE TRIGGER trg_biometric_updated_at BEFORE UPDATE ON biometric_attributes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_avatar_updated_at BEFORE UPDATE ON avatar_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_scenes_updated_at BEFORE UPDATE ON spatial_scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
