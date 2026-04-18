"""
Metadata Extractor Service
Extracts EXIF and other metadata from photos
"""

import io
import uuid
from datetime import datetime
from typing import Dict, Optional

import structlog
from PIL import Image, ExifTags, ImageOps

logger = structlog.get_logger()

class MetadataExtractor:
    """Extract metadata from photos for GDPR compliance and analytics"""
    
    def __init__(self, settings):
        self.settings = settings
    
    def extract_metadata(self, image_bytes: bytes, filename: str) -> Dict:
        """
        Extract comprehensive metadata from photo:
        - EXIF data (camera, settings, GPS)
        - Image dimensions and format
        - File size and hash
        - Processing timestamps
        """
        try:
            img = Image.open(io.BytesIO(image_bytes))
            
            # Basic image metadata
            metadata = {
                "filename": filename,
                "format": img.format,
                "mode": img.mode,
                "width_pixels": img.width,
                "height_pixels": img.height,
                "has_transparency": img.mode in ("RGBA", "P"),
                "extracted_at": datetime.utcnow().isoformat()
            }
            
            # EXIF data
            exif_data = self._extract_exif(img)
            if exif_data:
                metadata["exif"] = exif_data
            
            # Orientation (for auto-rotation)
            orientation = self._get_orientation(img)
            if orientation:
                metadata["orientation"] = orientation
                # Auto-rotate if needed
                if orientation > 1:
                    img = ImageOps.exif_transpose(img)
                    metadata["auto_rotated"] = True
            
            # Color profile info
            if hasattr(img, 'info') and 'icc_profile' in img.info:
                metadata["has_icc_profile"] = True
            
            # Calculate aspect ratio
            metadata["aspect_ratio"] = round(img.width / img.height, 2)
            
            # Determine if square, portrait, or landscape
            if img.width == img.height:
                metadata["orientation_type"] = "square"
            elif img.width > img.height:
                metadata["orientation_type"] = "landscape"
            else:
                metadata["orientation_type"] = "portrait"
            
            logger.info("metadata.extracted", filename=filename, keys=len(metadata))
            
            return metadata
            
        except Exception as e:
            logger.error("metadata.extraction_failed", filename=filename, error=str(e))
            return {
                "filename": filename,
                "error": str(e),
                "extracted_at": datetime.utcnow().isoformat()
            }
    
    def _extract_exif(self, img: Image) -> Optional[Dict]:
        """Extract EXIF data from image"""
        try:
            exif = img._getexif()
            if not exif:
                return None
            
            exif_data = {}
            
            for tag_id, value in exif.items():
                tag = ExifTags.TAGS.get(tag_id, tag_id)
                
                # Skip binary data and very long values
                if isinstance(value, bytes):
                    continue
                if isinstance(value, str) and len(value) > 200:
                    continue
                
                # Sanitize GPS data for privacy
                if tag and 'GPS' in tag:
                    continue  # Don't store GPS coordinates for privacy
                
                if tag:
                    exif_data[tag] = str(value)
            
            return exif_data if exif_data else None
            
        except Exception as e:
            logger.warning("exif.extraction_failed", error=str(e))
            return None
    
    def _get_orientation(self, img: Image) -> Optional[int]:
        """Get EXIF orientation value"""
        try:
            exif = img._getexif()
            if not exif:
                return None
            
            for tag_id, value in exif.items():
                tag = ExifTags.TAGS.get(tag_id, tag_id)
                if tag == 'Orientation':
                    return value
            
            return None
            
        except Exception:
            return None
    
    def get_safe_summary(self, metadata: Dict) -> Dict:
        """
        Return a privacy-safe summary of metadata
        (excludes sensitive data like GPS, timestamps, etc.)
        """
        safe_keys = [
            "filename", "format", "mode", "width_pixels", "height_pixels",
            "aspect_ratio", "orientation_type", "has_transparency", "auto_rotated"
        ]
        
        return {k: v for k, v in metadata.items() if k in safe_keys}
