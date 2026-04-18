-- DS3 Identity Graph - Row Level Security (RLS) for Tenant Isolation
-- Task 2.6: Privacy & Security Implementation

-- Enable RLS on all identity tables
ALTER TABLE master_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegated_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own master account
CREATE POLICY master_accounts_self_access ON master_accounts
    FOR ALL
    USING (id = current_setting('app.current_account_id')::UUID);

-- RLS Policy: Users can see profiles belonging to their master account
CREATE POLICY profiles_account_access ON profiles
    FOR ALL
    USING (master_account_id = current_setting('app.current_account_id')::UUID);

-- RLS Policy: Users can see delegated links where they are owner or delegator
CREATE POLICY delegated_links_user_access ON delegated_links
    FOR ALL
    USING (
        owner_account_id = current_setting('app.current_account_id')::UUID
        OR delegator_account_id = current_setting('app.current_account_id')::UUID
    );

-- RLS Policy: Users can see photos for their profiles
CREATE POLICY profile_photos_profile_access ON profile_photos
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM profiles 
        WHERE master_account_id = current_setting('app.current_account_id')::UUID
    ));

-- RLS Policy: Users can see attributes for their profiles
CREATE POLICY biometric_attributes_profile_access ON biometric_attributes
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM profiles 
        WHERE master_account_id = current_setting('app.current_account_id')::UUID
    ));

-- RLS Policy: Users can see vectors for their profiles
CREATE POLICY identity_vectors_profile_access ON identity_vectors
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM profiles 
        WHERE master_account_id = current_setting('app.current_account_id')::UUID
    ));

-- RLS Policy: Users can see avatar assets for their profiles
CREATE POLICY avatar_assets_profile_access ON avatar_assets
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM profiles 
        WHERE master_account_id = current_setting('app.current_account_id')::UUID
    ));

-- RLS Policy: Users can see spatial scenes for their profiles
CREATE POLICY spatial_scenes_profile_access ON spatial_scenes
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM profiles 
        WHERE master_account_id = current_setting('app.current_account_id')::UUID
    ));

-- RLS Policy: Users can see matching history for their profiles
CREATE POLICY matching_history_profile_access ON matching_history
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM profiles 
        WHERE master_account_id = current_setting('app.current_account_id')::UUID
    ));

-- Function to set the current account ID for the session
CREATE OR REPLACE FUNCTION set_current_account_id(account_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_account_id', account_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set the current tenant ID for the session
CREATE OR REPLACE FUNCTION set_current_tenant_id(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to application user
GRANT EXECUTE ON FUNCTION set_current_account_id(UUID) TO ds3_identity_user;
GRANT EXECUTE ON FUNCTION set_current_tenant_id(UUID) TO ds3_identity_user;

-- Comment
COMMENT ON FUNCTION set_current_account_id IS 'Set the current account ID for RLS context';
COMMENT ON FUNCTION set_current_tenant_id IS 'Set the current tenant ID for multi-tenant isolation';
