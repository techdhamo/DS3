-- DS3 Matching History & Feedback Schema
-- Task 2.10: Matching History & Feedback

-- Matching History Table
CREATE TABLE IF NOT EXISTS matching_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    product_id UUID NOT NULL,
    recommendation_score FLOAT NOT NULL,
    recommendation_rank INTEGER NOT NULL,
    recommendation_context JSONB,
    recommendation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- User Interaction Tracking
    clicked_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    added_to_cart_at TIMESTAMP WITH TIME ZONE,
    purchased_at TIMESTAMP WITH TIME ZONE,
    
    -- Feedback
    feedback_type VARCHAR(20), -- relevant, irrelevant, neutral, not_interested
    feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
    feedback_comment TEXT,
    feedback_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Model Version Tracking
    model_version VARCHAR(50),
    model_type VARCHAR(50), -- cosine_similarity, multi_objective, hybrid
    
    -- Session Information
    session_id UUID,
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for matching history
CREATE INDEX idx_matching_history_profile_id ON matching_history(profile_id);
CREATE INDEX idx_matching_history_product_id ON matching_history(product_id);
CREATE INDEX idx_matching_history_recommendation_timestamp ON matching_history(recommendation_timestamp DESC);
CREATE INDEX idx_matching_history_feedback_type ON matching_history(feedback_type);
CREATE INDEX idx_matching_history_purchased_at ON matching_history(purchased_at);
CREATE INDEX idx_matching_history_session_id ON matching_history(session_id);

-- Composite indexes for common queries
CREATE INDEX idx_matching_history_profile_timestamp ON matching_history(profile_id, recommendation_timestamp DESC);
CREATE INDEX idx_matching_history_product_feedback ON matching_history(product_id, feedback_type);
CREATE INDEX idx_matching_history_model_version ON matching_history(model_version, recommendation_timestamp DESC);

-- Recommendation Analytics Summary Table (materialized view or periodic aggregation)
CREATE TABLE IF NOT EXISTS recommendation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    profile_id UUID NOT NULL,
    
    -- Metrics
    total_recommendations INTEGER NOT NULL DEFAULT 0,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    total_views INTEGER NOT NULL DEFAULT 0,
    total_add_to_cart INTEGER NOT NULL DEFAULT 0,
    total_purchases INTEGER NOT NULL DEFAULT 0,
    
    -- Feedback metrics
    avg_feedback_score FLOAT,
    relevant_count INTEGER NOT NULL DEFAULT 0,
    irrelevant_count INTEGER NOT NULL DEFAULT 0,
    
    -- Derived metrics
    click_through_rate FLOAT,
    conversion_rate FLOAT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date, profile_id)
);

-- Indexes for analytics
CREATE INDEX idx_recommendation_analytics_date ON recommendation_analytics(date DESC);
CREATE INDEX idx_recommendation_analytics_profile_id ON recommendation_analytics(profile_id);
CREATE INDEX idx_recommendation_analytics_date_profile ON recommendation_analytics(date DESC, profile_id);

-- Model Performance Tracking Table
CREATE TABLE IF NOT EXISTS model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    
    -- Performance Metrics
    evaluation_date DATE NOT NULL,
    accuracy_score FLOAT,
    precision_score FLOAT,
    recall_score FLOAT,
    f1_score FLOAT,
    
    -- Business Metrics
    click_through_rate FLOAT,
    conversion_rate FLOAT,
    avg_order_value FLOAT,
    
    -- Training Data
    training_samples INTEGER,
    evaluation_samples INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(model_version, evaluation_date)
);

-- Indexes for model performance
CREATE INDEX idx_model_performance_version ON model_performance(model_version);
CREATE INDEX idx_model_performance_date ON model_performance(evaluation_date DESC);
CREATE INDEX idx_model_performance_type ON model_performance(model_type);

-- Trigger for updated_at on matching_history
CREATE OR REPLACE FUNCTION update_matching_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_matching_history_updated_at
    BEFORE UPDATE ON matching_history
    FOR EACH ROW
    EXECUTE FUNCTION update_matching_history_updated_at();

-- Trigger for updated_at on recommendation_analytics
CREATE TRIGGER trigger_update_recommendation_analytics_updated_at
    BEFORE UPDATE ON recommendation_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_matching_history_updated_at();

-- Trigger for updated_at on model_performance
CREATE TRIGGER trigger_update_model_performance_updated_at
    BEFORE UPDATE ON model_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_matching_history_updated_at();

-- Comment
COMMENT ON TABLE matching_history IS 'Tracks product recommendations and user interactions for feedback and analytics';
COMMENT ON TABLE recommendation_analytics IS 'Aggregated recommendation analytics per profile per day';
COMMENT ON TABLE model_performance IS 'Tracks ML model performance metrics over time';
