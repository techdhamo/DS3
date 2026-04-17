-- DS3 Identity Graph - Core Schema (Part 1)
-- Master Accounts, Profiles, Delegated Links

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Master Accounts
CREATE TABLE master_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    display_name VARCHAR(100),
    tier VARCHAR(20) DEFAULT 'free',
    status VARCHAR(20) DEFAULT 'active',
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_master_accounts_tenant ON master_accounts(tenant_id);
CREATE INDEX idx_master_accounts_email ON master_accounts(email);
CREATE INDEX idx_master_accounts_status ON master_accounts(status) WHERE status = 'active';

-- Virtual Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    master_account_id UUID NOT NULL REFERENCES master_accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(20) NOT NULL DEFAULT 'self',
    age_group VARCHAR(20),
    gender VARCHAR(20),
    avatar_url_3d TEXT,
    avatar_format VARCHAR(10),
    vector_id UUID,
    vector_status VARCHAR(20) DEFAULT 'pending',
    privacy_settings JSONB DEFAULT '{"show_weight": false, "show_bmi": false, "show_size": true, "show_style": true, "show_photos": false}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(master_account_id, name) WHERE deleted_at IS NULL
);

CREATE INDEX idx_profiles_master ON profiles(master_account_id);
CREATE INDEX idx_profiles_relationship ON profiles(relationship);
CREATE INDEX idx_profiles_active ON profiles(master_account_id, is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_profiles_privacy ON profiles USING GIN(privacy_settings);

-- Delegated Links
CREATE TABLE delegated_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    delegator_account_id UUID NOT NULL REFERENCES master_accounts(id) ON DELETE CASCADE,
    owner_account_id UUID NOT NULL REFERENCES master_accounts(id) ON DELETE CASCADE,
    owner_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    permissions JSONB DEFAULT '{"can_view_size": true, "can_view_weight": false, "can_order_for": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(delegator_account_id, owner_profile_id)
);

CREATE INDEX idx_delegated_delegator ON delegated_links(delegator_account_id);
CREATE INDEX idx_delegated_owner ON delegated_links(owner_account_id);
CREATE INDEX idx_delegated_profile ON delegated_links(owner_profile_id);
CREATE INDEX idx_delegated_status ON delegated_links(status);
CREATE INDEX idx_delegated_tenant ON delegated_links(tenant_id);

-- Profile Photos
CREATE TABLE profile_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    photo_type VARCHAR(20) NOT NULL,
    storage_bucket VARCHAR(100) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    encryption_key_id VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT,
    upload_status VARCHAR(20) DEFAULT 'uploaded',
    features_extracted BOOLEAN DEFAULT false,
    delete_after TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    deleted_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_photos_profile ON profile_photos(profile_id);
CREATE INDEX idx_photos_type ON profile_photos(photo_type);
CREATE INDEX idx_photos_status ON profile_photos(upload_status);
CREATE INDEX idx_photos_delete ON profile_photos(delete_after) WHERE deleted_at IS NULL;
CREATE INDEX idx_photos_tenant ON profile_photos(tenant_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_master_accounts_updated_at BEFORE UPDATE ON master_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_delegated_links_updated_at BEFORE UPDATE ON delegated_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views
CREATE VIEW v_profiles_active AS
SELECT p.*, ma.email as master_email
FROM profiles p
JOIN master_accounts ma ON p.master_account_id = ma.id
WHERE p.deleted_at IS NULL AND p.is_active = true AND ma.deleted_at IS NULL;
