"""
DS3 Perception Engine
Task 2.4: AI Feature Extraction from Photos
Extracts 1000+ biometric attributes using MediaPipe, ResNet, CLIP
"""

import os
import uuid
from contextlib import asynccontextmanager
from typing import Optional

import structlog
from fastapi import FastAPI, File, Query, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import Settings, get_settings
from app.services.photo_processor import PhotoProcessor
from app.services.feature_extractor import FeatureExtractor
from app.services.vector_generator import VectorGenerator
from app.db.database import init_db, close_db

logger = structlog.get_logger()

# Pydantic models for API
class PhotoUploadRequest(BaseModel):
    profile_id: uuid.UUID
    photo_type: str = Field(..., pattern="^(front|side_left|side_right|back|detail_face|detail_hands|full_body)$")

class PhotoUploadResponse(BaseModel):
    photo_id: uuid.UUID
    upload_url: str
    status: str
    message: str

class ProcessingStatusResponse(BaseModel):
    photo_id: uuid.UUID
    status: str  # uploaded, processing, completed, failed
    progress: int = Field(..., ge=0, le=100)
    features_extracted: int
    features_total: int
    error_message: Optional[str] = None

class ProfileAttributesResponse(BaseModel):
    profile_id: uuid.UUID
    attributes: dict
    vector_status: str
    vector_generated_at: Optional[str]
    extraction_confidence: float

class VectorResponse(BaseModel):
    profile_id: uuid.UUID
    vector_segments: dict
    generation_status: str
    similarity_ready: bool

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    settings = get_settings()
    await init_db(settings.database_url)
    logger.info("perception_engine.startup", database_connected=True)
    
    yield
    
    # Shutdown
    await close_db()
    logger.info("perception_engine.shutdown")

app = FastAPI(
    title="DS3 Perception Engine",
    description="AI-powered biometric feature extraction from photos",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - explicit origins required when allow_credentials=True
_ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS if _ALLOWED_ORIGINS else ["*"],
    allow_credentials=bool(_ALLOWED_ORIGINS),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "perception-engine",
        "version": "1.0.0",
        "features": ["mediapipe", "resnet", "clip"]
    }

_PHOTO_TYPE_PATTERN = "^(front|side_left|side_right|back|detail_face|detail_hands|full_body)$"

# Upload photo endpoint
@app.post("/v1/perception/photos", response_model=PhotoUploadResponse)
async def upload_photo(
    profile_id: uuid.UUID,
    photo_type: str = Query(..., pattern=_PHOTO_TYPE_PATTERN),
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings)
):
    """
    Upload a photo for AI processing.
    Supported types: front, side_left, side_right, back, detail_face, detail_hands, full_body
    """
    processor = PhotoProcessor(settings)
    
    try:
        result = await processor.process_upload(
            profile_id=profile_id,
            photo_type=photo_type,
            file=file
        )
        
        logger.info("photo.uploaded", 
                   photo_id=str(result["photo_id"]),
                   profile_id=str(profile_id),
                   photo_type=photo_type)
        
        return PhotoUploadResponse(
            photo_id=result["photo_id"],
            upload_url=result["upload_url"],
            status="uploaded",
            message="Photo uploaded successfully. Processing will begin shortly."
        )
    
    except Exception as e:
        logger.error("photo.upload_failed", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

# Get processing status
@app.get("/v1/perception/photos/{photo_id}/status", response_model=ProcessingStatusResponse)
async def get_processing_status(
    photo_id: uuid.UUID,
    settings: Settings = Depends(get_settings)
):
    """Get the processing status of a photo"""
    processor = PhotoProcessor(settings)
    
    try:
        status = await processor.get_status(photo_id)
        return ProcessingStatusResponse(**status)
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=404, detail=f"Photo not found: {e}")
    except Exception as e:
        logger.error("status.fetch_failed", photo_id=str(photo_id), error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")

# Get profile attributes
@app.get("/v1/perception/profiles/{profile_id}/attributes", response_model=ProfileAttributesResponse)
async def get_profile_attributes(
    profile_id: uuid.UUID,
    settings: Settings = Depends(get_settings)
):
    """
    Get all extracted biometric attributes for a profile.
    Returns 1000+ attributes across categories:
    - facial_geometry
    - skin_tone
    - body_metrics
    - style_profile
    - accessory_fit
    - cosmetic_profile
    - behavioral
    """
    extractor = FeatureExtractor(settings)
    
    try:
        attributes = await extractor.get_all_attributes(profile_id)
        
        return ProfileAttributesResponse(
            profile_id=profile_id,
            attributes=attributes,
            vector_status=attributes.get("_meta", {}).get("vector_status", "unknown"),
            vector_generated_at=attributes.get("_meta", {}).get("vector_generated_at"),
            extraction_confidence=attributes.get("_meta", {}).get("confidence", 0.0)
        )
    
    except Exception as e:
        logger.error("attributes.fetch_failed", profile_id=str(profile_id), error=str(e))
        raise HTTPException(status_code=404, detail=str(e))

# Get profile vector
@app.get("/v1/perception/profiles/{profile_id}/vector", response_model=VectorResponse)
async def get_profile_vector(
    profile_id: uuid.UUID,
    settings: Settings = Depends(get_settings)
):
    """
    Get the 1000-dimensional identity vector for a profile.
    Vector is segmented into: facial(128), skin(64), body(32), style(256), 
    accessory(128), cosmetic(128), behavioral(256)
    """
    generator = VectorGenerator(settings)
    
    try:
        vector_data = await generator.get_vector(profile_id)
        
        return VectorResponse(
            profile_id=profile_id,
            vector_segments=vector_data["segments"],
            generation_status=vector_data["status"],
            similarity_ready=vector_data["status"] == "completed"
        )
    
    except Exception as e:
        logger.error("vector.fetch_failed", profile_id=str(profile_id), error=str(e))
        raise HTTPException(status_code=404, detail=str(e))

# Trigger re-processing
@app.post("/v1/perception/profiles/{profile_id}/reprocess")
async def reprocess_profile(
    profile_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    settings: Settings = Depends(get_settings)
):
    """Trigger re-processing of all photos for a profile"""
    extractor = FeatureExtractor(settings)
    
    job_id = str(uuid.uuid4())
    # Schedule without a try/except – add_task itself doesn't raise for async errors;
    # errors inside reprocess_all_photos must be handled there.
    background_tasks.add_task(extractor.reprocess_all_photos, profile_id)

    return {
        "profile_id": str(profile_id),
        "job_id": job_id,
        "status": "processing_queued",
        "message": "Re-processing started in background"
    }

# Batch processing status
@app.get("/v1/perception/profiles/{profile_id}/processing-status")
async def get_profile_processing_status(
    profile_id: uuid.UUID,
    settings: Settings = Depends(get_settings)
):
    """Get comprehensive processing status for a profile"""
    processor = PhotoProcessor(settings)
    extractor = FeatureExtractor(settings)
    generator = VectorGenerator(settings)
    
    try:
        photos_status = await processor.get_profile_photos_status(profile_id)
        extraction_status = await extractor.get_extraction_status(profile_id)
        vector_status = await generator.get_generation_status(profile_id)
        
        return {
            "profile_id": str(profile_id),
            "photos": photos_status,
            "extraction": extraction_status,
            "vector": vector_status,
            "overall_status": _calculate_overall_status(
                photos_status, extraction_status, vector_status
            )
        }
    
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

def _calculate_overall_status(photos, extraction, vector):
    """Calculate overall processing status"""
    if vector["status"] == "completed":
        return "ready"
    elif extraction["status"] == "completed":
        return "vector_pending"
    elif photos["all_uploaded"]:
        return "extraction_pending"
    else:
        return "photos_pending"

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
