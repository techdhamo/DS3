"""SQLAlchemy models for Perception Engine"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, DateTime, Integer, Float, Boolean, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class ProfilePhoto(Base):
    """Encrypted photo storage with processing status"""
    __tablename__ = "profile_photos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, default=uuid.UUID("00000000-0000-0000-0000-000000000000"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    # Photo metadata
    photo_type = Column(String(20), nullable=False)  # front, side_left, side_right, etc.
    
    # Storage (encrypted)
    storage_bucket = Column(String(100), nullable=False)
    storage_key = Column(String(500), nullable=False)
    encryption_key_id = Column(String(255), nullable=False)
    
    # File metadata
    original_filename = Column(String(255))
    file_size_bytes = Column(Integer)
    mime_type = Column(String(100))
    width_pixels = Column(Integer)
    height_pixels = Column(Integer)
    
    # Processing status
    upload_status = Column(String(20), default="uploaded")  # uploaded, processing, completed, failed
    ai_processing_job_id = Column(UUID(as_uuid=True))
    ai_processing_error = Column(Text)
    features_extracted = Column(Boolean, default=False)
    
    # Quality
    quality_score = Column(Float)
    quality_issues = Column(JSON)
    
    # Lifecycle
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)
    delete_after = Column(DateTime)
    deleted_at = Column(DateTime)
    deleted_reason = Column(String(50))
    
    # Audit
    uploaded_by = Column(UUID(as_uuid=True))
    ip_address = Column(String(50))
    user_agent = Column(Text)
    
    profile = relationship("Profile", back_populates="photos")

class BiometricAttribute(Base):
    """Extracted 1000+ biometric attributes"""
    __tablename__ = "biometric_attributes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, default=uuid.UUID("00000000-0000-0000-0000-000000000000"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    # Attribute details
    category = Column(String(50), nullable=False)  # facial_geometry, skin_tone, body_metrics, etc.
    attribute_name = Column(String(100), nullable=False)
    attribute_display_name = Column(String(200))
    attribute_description = Column(Text)
    
    # Value (flexible JSON)
    attribute_value = Column(JSON, nullable=False)
    data_type = Column(String(20))  # string, number, boolean, array, object, vector
    
    # AI confidence
    confidence_score = Column(Float, nullable=False)
    
    # Source
    extracted_from_photo_id = Column(UUID(as_uuid=True), ForeignKey("profile_photos.id"))
    extraction_method = Column(String(50))  # mediapipe, custom_cnn, clip, resnet
    model_version = Column(String(20))
    
    # Validation
    validated_by_user = Column(Boolean)
    validated_at = Column(DateTime)
    user_correction = Column(JSON)
    
    # Privacy
    is_sensitive = Column(Boolean, default=False)
    requires_consent = Column(Boolean, default=False)
    
    extracted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        # Unique constraint per profile + attribute name
        {'schema': 'public'}
    )

class IdentityVector(Base):
    """1000-dimensional identity vectors (requires pgvector extension)"""
    __tablename__ = "identity_vectors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, default=uuid.UUID("00000000-0000-0000-0000-000000000000"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), unique=True, nullable=False)
    
    # Vector stored as array (pgvector extension provides vector type)
    # For now using JSON, migrate to vector type after installing pgvector
    vector_json = Column(JSON)  # 1000-dimensional array
    
    # Segmented vectors
    facial_segment = Column(JSON)      # 128-dim
    skin_segment = Column(JSON)        # 64-dim
    body_segment = Column(JSON)        # 32-dim
    style_segment = Column(JSON)       # 256-dim
    accessory_segment = Column(JSON)   # 128-dim
    cosmetic_segment = Column(JSON)   # 128-dim
    behavioral_segment = Column(JSON)  # 256-dim
    
    model_version = Column(String(20))
    generated_at = Column(DateTime, default=datetime.utcnow)
    last_synced_at = Column(DateTime)

class AvatarAsset(Base):
    """3D avatar models"""
    __tablename__ = "avatar_assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, default=uuid.UUID("00000000-0000-0000-0000-000000000000"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    asset_type = Column(String(20), nullable=False)  # base_body, base_face, clothing, etc.
    format = Column(String(10), nullable=False)  # usdz, gltf, glb, fbx, vrm
    
    storage_url = Column(Text, nullable=False)
    storage_provider = Column(String(20), default="s3")
    
    file_size_bytes = Column(Integer)
    polygon_count = Column(Integer)
    texture_resolution = Column(String(20))
    
    generated_by = Column(String(50))  # readyplayer.me, custom_pipeline
    generation_job_id = Column(UUID(as_uuid=True))
    source_photos = Column(ARRAY(UUID(as_uuid=True)))
    
    version = Column(Integer, default=1)
    is_current = Column(Boolean, default=True)
    
    quality_score = Column(Float)
    likeness_score = Column(Float)
    
    status = Column(String(20), default="processing")  # processing, completed, failed, deprecated
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
