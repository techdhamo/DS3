-- DS3 Identity Graph - Audit & Security Schema
-- Task 2.6: Privacy & Security Implementation

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    actor_id UUID NOT NULL,
    actor_type VARCHAR(50) NOT NULL, -- master_account, system, service
    action VARCHAR(50) NOT NULL, -- create, update, delete, read, export, etc.
    resource_type VARCHAR(50) NOT NULL, -- profile, photo, attribute, etc.
    resource_id UUID,
    target_id UUID, -- For delegated actions
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) NOT NULL, -- success, failure
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_tenant_action ON audit_logs(tenant_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_tenant_resource ON audit_logs(tenant_id, resource_type, created_at DESC);

-- Enable Row Level Security for tenant isolation
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see audit logs for their own tenant
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS Policy: System users can see all audit logs
CREATE POLICY audit_logs_system_access ON audit_logs
    USING (actor_type = 'system');

-- Partition audit logs by month (optional, for large scale)
-- Uncomment for production with high volume
-- CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Trigger for updated_at on other tables (if needed)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to identity tables (if they don't have it already)
-- CREATE TRIGGER update_master_accounts_updated_at BEFORE UPDATE ON master_accounts
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE audit_logs IS 'Audit log for all identity operations for GDPR compliance and security monitoring';
COMMENT ON COLUMN audit_logs.tenant_id IS 'Tenant ID for multi-tenant isolation';
COMMENT ON COLUMN audit_logs.actor_id IS 'ID of the user/system performing the action';
COMMENT ON COLUMN audit_logs.actor_type IS 'Type of actor: master_account, system, or service';
COMMENT ON COLUMN audit_logs.action IS 'Action performed: create, update, delete, read, export, etc.';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected: profile, photo, attribute, etc.';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.target_id IS 'ID of the target profile for delegated actions';
COMMENT ON COLUMN audit_logs.details IS 'Additional details in JSONB format';
COMMENT ON COLUMN audit_logs.status IS 'Status of the operation: success or failure';
