"""
Photo Cleanup Job
Scheduled job to delete photos that have exceeded their retention period
"""

import uuid
from datetime import datetime, timedelta
from typing import List

import structlog
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.db.models import ProfilePhoto

logger = structlog.get_logger()

class PhotoCleanupJob:
    """Scheduled job to clean up expired photos"""
    
    def __init__(self, settings, s3_client=None):
        self.settings = settings
        self.s3_client = s3_client
        if s3_client is None:
            import boto3
            self.s3_client = boto3.client('s3', region_name=settings.aws_region)
    
    async def cleanup_expired_photos(self) -> dict:
        """
        Find and delete photos that have exceeded their retention period
        """
        results = {
            "scanned": 0,
            "deleted": 0,
            "failed": 0,
            "errors": []
        }
        
        try:
            async with get_db_session() as session:
                # Find photos past their delete_after date
                now = datetime.utcnow()
                expired_photos = await session.execute(
                    select(ProfilePhoto).where(
                        ProfilePhoto.delete_after < now
                    )
                )
                expired_photos = expired_photos.scalars().all()
                
                results["scanned"] = len(expired_photos)
                
                for photo in expired_photos:
                    try:
                        # Delete from S3
                        await self._delete_from_s3(photo)
                        
                        # Delete from database
                        await session.execute(
                            delete(ProfilePhoto).where(ProfilePhoto.id == photo.id)
                        )
                        
                        results["deleted"] += 1
                        logger.info("photo.deleted", 
                                   photo_id=str(photo.id), 
                                   profile_id=str(photo.profile_id),
                                   storage_key=photo.storage_key)
                        
                    except Exception as e:
                        results["failed"] += 1
                        results["errors"].append({
                            "photo_id": str(photo.id),
                            "error": str(e)
                        })
                        logger.error("photo.deletion_failed", 
                                   photo_id=str(photo.id), 
                                   error=str(e))
                
                await session.commit()
            
            logger.info("photo.cleanup.completed", results=results)
            return results
            
        except Exception as e:
            logger.error("photo.cleanup.failed", error=str(e))
            raise
    
    async def _delete_from_s3(self, photo: ProfilePhoto):
        """Delete photo from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=photo.storage_bucket,
                Key=photo.storage_key
            )
        except Exception as e:
            logger.error("s3.deletion_failed", 
                       bucket=photo.storage_bucket,
                       key=photo.storage_key,
                       error=str(e))
            raise
    
    async def cleanup_orphaned_photos(self) -> dict:
        """
        Find and delete photos that have no associated profile
        """
        results = {
            "scanned": 0,
            "deleted": 0,
            "failed": 0,
            "errors": []
        }
        
        try:
            async with get_db_session() as session:
                # Find photos with deleted profiles
                orphaned_photos = await session.execute(
                    select(ProfilePhoto).where(
                        ProfilePhoto.profile_id.in_(
                            select(ProfilePhoto.profile_id)
                            .outerjoin(ProfilePhoto.profile)
                            .where(ProfilePhoto.profile.is_deleted == True)
                        )
                    )
                )
                orphaned_photos = orphaned_photos.scalars().all()
                
                results["scanned"] = len(orphaned_photos)
                
                for photo in orphaned_photos:
                    try:
                        await self._delete_from_s3(photo)
                        await session.execute(
                            delete(ProfilePhoto).where(ProfilePhoto.id == photo.id)
                        )
                        results["deleted"] += 1
                        
                    except Exception as e:
                        results["failed"] += 1
                        results["errors"].append({
                            "photo_id": str(photo.id),
                            "error": str(e)
                        })
                
                await session.commit()
            
            logger.info("photo.orphan_cleanup.completed", results=results)
            return results
            
        except Exception as e:
            logger.error("photo.orphan_cleanup.failed", error=str(e))
            raise
    
    async def get_cleanup_statistics(self) -> dict:
        """Get statistics about photos pending deletion"""
        try:
            async with get_db_session() as session:
                now = datetime.utcnow()
                
                # Count expired photos
                expired_count = await session.execute(
                    select(ProfilePhoto).where(ProfilePhoto.delete_after < now)
                )
                expired_count = len(expired_count.scalars().all())
                
                # Count photos expiring in next 7 days
                next_week = now + timedelta(days=7)
                expiring_soon = await session.execute(
                    select(ProfilePhoto).where(
                        ProfilePhoto.delete_after >= now,
                        ProfilePhoto.delete_after < next_week
                    )
                )
                expiring_soon = len(expiring_soon.scalars().all())
                
                # Count total photos
                total_count = await session.execute(select(ProfilePhoto))
                total_count = len(total_count.scalars().all())
                
                return {
                    "total_photos": total_count,
                    "expired_photos": expired_count,
                    "expiring_in_7_days": expiring_soon,
                    "cleanup_date": now.isoformat()
                }
                
        except Exception as e:
            logger.error("cleanup.statistics_failed", error=str(e))
            raise
