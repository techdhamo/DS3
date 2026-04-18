"""
Photo Processing Service
Handles encrypted upload to S3 and triggers AI processing
"""

import io
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional

import boto3
import structlog
from botocore.exceptions import ClientError
from PIL import Image

from app.db.database import get_db_session
from app.db.models import ProfilePhoto

logger = structlog.get_logger()

class PhotoProcessor:
    """Process photo uploads with encryption and lifecycle management"""
    
    def __init__(self, settings):
        self.settings = settings
        
        # AWS clients
        self.s3_client = boto3.client(
            's3',
            region_name=settings.aws_region
        )
        self.kms_client = boto3.client(
            'kms',
            region_name=settings.aws_region
        )
        
        logger.info("photo_processor.initialized", bucket=settings.s3_bucket)
    
    async def process_upload(
        self,
        profile_id: uuid.UUID,
        photo_type: str,
        file: object
    ) -> Dict:
        """
        Process photo upload:
        1. Validate image
        2. Generate encryption key
        3. Upload to S3 with encryption
        4. Store metadata in database
        5. Trigger AI processing
        """
        try:
            # Read file content
            content = await file.read()
            
            # Validate
            self._validate_image(content, file.filename)
            
            # Generate unique IDs
            photo_id = uuid.uuid4()
            storage_key = f"profiles/{profile_id}/photos/{photo_id}/{file.filename}"
            
            # Get image dimensions
            img = Image.open(io.BytesIO(content))
            width, height = img.size
            
            # Upload to S3 with SSE-KMS encryption
            encryption_key_id = await self._upload_encrypted(
                storage_key,
                content,
                file.content_type
            )
            
            # Store in database
            async with get_db_session() as session:
                photo = ProfilePhoto(
                    id=photo_id,
                    profile_id=profile_id,
                    photo_type=photo_type,
                    storage_bucket=self.settings.s3_bucket,
                    storage_key=storage_key,
                    encryption_key_id=encryption_key_id,
                    original_filename=file.filename,
                    file_size_bytes=len(content),
                    mime_type=file.content_type,
                    width_pixels=width,
                    height_pixels=height,
                    delete_after=datetime.utcnow() + timedelta(days=30),
                    upload_status="uploaded"
                )
                session.add(photo)
                await session.commit()
            
            # Generate pre-signed URL for immediate access
            presigned_url = self._generate_presigned_url(storage_key)
            
            # Trigger background processing (would be done via Kafka in production)
            await self._trigger_processing(photo_id, profile_id)
            
            logger.info("photo.processed",
                     photo_id=str(photo_id),
                     profile_id=str(profile_id),
                     size=len(content))
            
            return {
                "photo_id": photo_id,
                "upload_url": presigned_url,
                "status": "uploaded",
                "expires_at": photo.delete_after.isoformat()
            }
            
        except Exception as e:
            logger.error("photo.process_failed", error=str(e))
            raise e
    
    def _validate_image(self, content: bytes, filename: str) -> None:
        """Validate image format and size"""
        # Check size
        if len(content) > self.settings.max_image_size:
            raise ValueError(f"Image too large: {len(content)} bytes (max {self.settings.max_image_size})")
        
        # Check format
        try:
            img = Image.open(io.BytesIO(content))
            if img.format not in ['JPEG', 'PNG', 'WEBP']:
                raise ValueError(f"Unsupported format: {img.format}")
        except Exception as e:
            raise ValueError(f"Invalid image: {e}") from e
        
        logger.debug("image.validated", format=img.format, size=len(content))
    
    async def _upload_encrypted(
        self,
        storage_key: str,
        content: bytes,
        content_type: str
    ) -> str:
        """Upload to S3 with SSE-KMS encryption"""
        try:
            self.s3_client.put_object(
                Bucket=self.settings.s3_bucket,
                Key=storage_key,
                Body=content,
                ContentType=content_type,
                ServerSideEncryption='aws:kms',
                SSEKMSKeyId=self.settings.kms_key_id,
                Metadata={
                    'upload-timestamp': datetime.utcnow().isoformat()
                }
            )
            
            return self.settings.kms_key_id
            
        except ClientError as e:
            logger.error("s3.upload_failed", error=str(e))
            raise
    
    def _generate_presigned_url(self, storage_key: str, expiration: int = 3600) -> str:
        """Generate temporary access URL"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.settings.s3_bucket,
                    'Key': storage_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error("presigned_url.failed", error=str(e))
            raise
    
    async def _trigger_processing(self, photo_id: uuid.UUID, profile_id: uuid.UUID) -> None:
        """Trigger AI processing via Kafka or background task"""
        # In production: publish to Kafka topic
        # For now, log the intent
        logger.info("processing.triggered",
                  photo_id=str(photo_id),
                  profile_id=str(profile_id))
    
    async def get_status(self, photo_id: uuid.UUID) -> Dict:
        """Get processing status of a photo"""
        async with get_db_session() as session:
            photo = await session.get(ProfilePhoto, photo_id)
            
            if not photo:
                raise ValueError("Photo not found")
            
            # Calculate progress
            progress = 0
            if photo.upload_status == "uploaded":
                progress = 10
            elif photo.upload_status == "processing":
                progress = 50
            elif photo.upload_status == "completed":
                progress = 100
            elif photo.upload_status == "failed":
                progress = 0
            
            return {
                "photo_id": photo_id,
                "status": photo.upload_status,
                "progress": progress,
                "features_extracted": 100 if photo.features_extracted else 0,
                "features_total": 100,
                "error_message": photo.ai_processing_error
            }
    
    async def get_profile_photos_status(self, profile_id: uuid.UUID) -> Dict:
        """Get status of all photos for a profile"""
        async with get_db_session() as session:
            from sqlalchemy import select, func
            from app.db.models import ProfilePhoto
            
            result = await session.execute(
                select(
                    func.count().label("total"),
                    func.sum(ProfilePhoto.upload_status == "uploaded").label("uploaded"),
                    func.sum(ProfilePhoto.upload_status == "completed").label("completed"),
                    func.sum(ProfilePhoto.features_extracted).label("with_features")
                ).where(
                    ProfilePhoto.profile_id == profile_id,
                    ProfilePhoto.deleted_at.is_(None)
                )
            )
            
            row = result.fetchone()
            
            total = row.total or 0
            completed = row.completed or 0
            
            return {
                "total_photos": total,
                "uploaded": row.uploaded or 0,
                "completed": completed,
                "with_features": row.with_features or 0,
                "all_uploaded": total > 0 and (row.uploaded or 0) == total,
                "all_processed": total > 0 and completed == total
            }
