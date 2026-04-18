"""Configuration for Perception Engine"""

from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    app_name: str = "DS3 Perception Engine"
    debug: bool = False
    
    # Database - must be provided via environment variable
    database_url: str = Field(default="postgresql://localhost:5432/ds3_identity", validate_default=True)
    
    # AWS
    aws_region: str = "ap-south-1"
    s3_bucket: str = "ds3-identity-photos"
    kms_key_id: str = "alias/ds3-identity-encryption"
    
    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic_photo_uploaded: str = "photo.uploaded"
    kafka_topic_processing_complete: str = "processing.complete"
    
    # AI Models
    mediapipe_model_complexity: int = 2  # 0=lite, 1=full, 2=heavy
    clip_model_name: str = "ViT-B/32"
    
    # Vector Generation
    vector_dimensions: int = 1000
    vector_segments: dict = {
        "facial": 128,
        "skin": 64,
        "body": 32,
        "style": 256,
        "accessory": 128,
        "cosmetic": 128,
        "behavioral": 256
    }
    
    # Processing
    max_image_size: int = 50 * 1024 * 1024  # 50MB
    supported_formats: list = ["image/jpeg", "image/png", "image/webp"]
    
    # Feature Extraction Thresholds
    min_confidence_score: float = 0.5
    high_confidence_threshold: float = 0.9
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        validate_assignment=True
    )

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
