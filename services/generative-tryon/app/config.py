"""
Configuration Settings for Generative Try-On Service
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    app_name: str = "DS3 Generative Try-On Service"
    debug: bool = False
    
    # Database - must be provided via environment variable
    database_url: str = Field(default="postgresql://localhost:5432/ds3_identity", validate_default=True)
    
    # AWS Configuration
    aws_region: str = Field(default="ap-south-1")
    s3_bucket: str = Field(default="ds3-tryon-results")
    
    # Stable Diffusion Configuration
    sd_model_id: str = Field(default="runwayml/stable-diffusion-v1-5")
    sd_device: str = Field(default="cuda")  # or "cpu"
    
    # ControlNet Configuration
    controlnet_pose_model: str = Field(default="lllyasviel/sd-controlnet-openpose")
    controlnet_depth_model: str = Field(default="lllyasviel/sd-controlnet-depth")
    controlnet_canny_model: str = Field(default="lllyasviel/sd-controlnet-canny")
    
    # SAM Configuration
    sam_model_id: str = Field(default="facebook/sam-vit-huge")
    sam_device: str = Field(default="cuda")
    
    # Inference Configuration
    default_num_inference_steps: int = Field(default=20, ge=10, le=50)
    default_guidance_scale: float = Field(default=7.5, ge=5.0, le=15.0)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

def get_settings() -> Settings:
    return Settings()
