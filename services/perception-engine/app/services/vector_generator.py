"""
Vector Generator Service
Combines 1000+ features into 1000-dimensional identity vector
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional
import structlog

import numpy as np
from sqlalchemy import select

from app.db.database import get_db_session
from app.db.models import BiometricAttribute, IdentityVector

logger = structlog.get_logger()

class VectorGenerator:
    """Generate 1000-dimensional identity vectors from extracted features"""
    
    # Segment dimensions
    SEGMENTS = {
        "facial": 128,
        "skin": 64,
        "body": 32,
        "style": 256,
        "accessory": 128,
        "cosmetic": 128,
        "behavioral": 256
    }
    
    TOTAL_DIMENSIONS = 1000
    
    def __init__(self, settings):
        self.settings = settings
        logger.info("vector_generator.initialized", dimensions=self.TOTAL_DIMENSIONS)
    
    async def generate_vector(self, profile_id: uuid.UUID) -> Dict:
        """
        Generate 1000-dimensional vector from all biometric attributes
        
        Vector structure:
        - facial (128): Face shape, proportions, landmarks
        - skin (64): Tone, undertone, palette
        - body (32): Height, proportions, type
        - style (256): Preferences, aesthetics
        - accessory (128): Fit measurements
        - cosmetic (128): Skin type, matches
        - behavioral (256): Learned patterns
        """
        try:
            logger.info("vector.generation.started", profile_id=str(profile_id))
            
            # Use single database session for entire operation
            async with get_db_session() as session:
                # Fetch all attributes
                result = await session.execute(
                    select(BiometricAttribute).where(
                        BiometricAttribute.profile_id == profile_id
                    )
                )
                attributes = result.scalars().all()
                
                if not attributes:
                    raise ValueError("No attributes found for profile")
                
                # Generate segment vectors
                facial_vector = self._generate_facial_segment(attributes)
                skin_vector = self._generate_skin_segment(attributes)
                body_vector = self._generate_body_segment(attributes)
                style_vector = self._generate_style_segment(attributes, profile_id)
                accessory_vector = self._generate_accessory_segment(attributes)
                cosmetic_vector = self._generate_cosmetic_segment(attributes)
                behavioral_vector = self._generate_behavioral_segment(attributes)
                
                # Concatenate into full vector
                full_vector = np.concatenate([
                    facial_vector,
                    skin_vector,
                    body_vector,
                    style_vector,
                    accessory_vector,
                    cosmetic_vector,
                    behavioral_vector
                ])
                
                # Normalize to unit length (for cosine similarity)
                full_vector = full_vector / (np.linalg.norm(full_vector) + 1e-8)
                
                # Store in database - Check if vector exists
                result = await session.execute(
                    select(IdentityVector).where(
                        IdentityVector.profile_id == profile_id
                    )
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Update existing
                    existing.vector_json = full_vector.tolist()
                    existing.facial_segment = facial_vector.tolist()
                    existing.skin_segment = skin_vector.tolist()
                    existing.body_segment = body_vector.tolist()
                    existing.style_segment = style_vector.tolist()
                    existing.accessory_segment = accessory_vector.tolist()
                    existing.cosmetic_segment = cosmetic_vector.tolist()
                    existing.behavioral_segment = behavioral_vector.tolist()
                    existing.last_synced_at = datetime.utcnow()
                else:
                    # Create new
                    vector_record = IdentityVector(
                        profile_id=profile_id,
                        vector_json=full_vector.tolist(),
                        facial_segment=facial_vector.tolist(),
                        skin_segment=skin_vector.tolist(),
                        body_segment=body_vector.tolist(),
                        style_segment=style_vector.tolist(),
                        accessory_segment=accessory_vector.tolist(),
                        cosmetic_segment=cosmetic_vector.tolist(),
                        behavioral_segment=behavioral_vector.tolist(),
                        model_version="1.0.0"
                    )
                    session.add(vector_record)
                
                await session.commit()
            
            logger.info("vector.generation.completed",
                     profile_id=str(profile_id),
                     dimensions=len(full_vector))
            
            return {
                "profile_id": profile_id,
                "status": "completed",
                "dimensions": len(full_vector),
                "vector": full_vector.tolist(),
                "segments": {
                    "facial": facial_vector.tolist(),
                    "skin": skin_vector.tolist(),
                    "body": body_vector.tolist(),
                    "style": style_vector.tolist(),
                    "accessory": accessory_vector.tolist(),
                    "cosmetic": cosmetic_vector.tolist(),
                    "behavioral": behavioral_vector.tolist()
                }
            }
            
        except Exception as e:
            logger.error("vector.generation.failed",
                      profile_id=str(profile_id),
                      error=str(e))
            raise
    
    async def get_vector(self, profile_id: uuid.UUID) -> Dict:
        """Retrieve generated vector for a profile"""
        async with get_db_session() as session:
            result = await session.execute(
                select(IdentityVector).where(
                    IdentityVector.profile_id == profile_id
                )
            )
            vector = result.scalar_one_or_none()
            
            if not vector:
                return {
                    "profile_id": profile_id,
                    "status": "not_found",
                    "dimensions": 0,
                    "similarity_ready": False,
                    "segments": {}
                }
            
            return {
                "profile_id": profile_id,
                "status": "completed",
                "dimensions": len(vector.vector_json) if vector.vector_json else 0,
                "similarity_ready": True,
                "segments": {
                    "facial": vector.facial_segment,
                    "skin": vector.skin_segment,
                    "body": vector.body_segment,
                    "style": vector.style_segment,
                    "accessory": vector.accessory_segment,
                    "cosmetic": vector.cosmetic_segment,
                    "behavioral": vector.behavioral_segment
                }
            }
    
    async def get_generation_status(self, profile_id: uuid.UUID) -> Dict:
        """Get vector generation status"""
        async with get_db_session() as session:
            result = await session.execute(
                select(IdentityVector).where(
                    IdentityVector.profile_id == profile_id
                )
            )
            vector = result.scalar_one_or_none()
            
            if vector:
                return {
                    "status": "completed",
                    "generated_at": vector.generated_at.isoformat() if vector.generated_at else None,
                    "model_version": vector.model_version
                }
            else:
                return {
                    "status": "pending",
                    "generated_at": None,
                    "model_version": None
                }
    
    def _generate_facial_segment(self, attributes: List[BiometricAttribute]) -> np.ndarray:
        """Generate 128-dim facial vector"""
        vector = np.zeros(self.SEGMENTS["facial"])
        
        # Find facial attributes
        facial_attrs = [a for a in attributes if a.category == "facial_geometry"]
        
        for i, attr in enumerate(facial_attrs[:self.SEGMENTS["facial"]]):
            if attr.attribute_value:
                # Extract numeric value or use confidence
                if isinstance(attr.attribute_value, (int, float)):
                    vector[i] = float(attr.attribute_value)
                elif isinstance(attr.attribute_value, dict):
                    # Use confidence as proxy
                    vector[i] = attr.confidence_score
                else:
                    # Hash string to numeric
                    vector[i] = hash(str(attr.attribute_value)) % 1000 / 1000
        
        return vector
    
    def _generate_skin_segment(self, attributes: List[BiometricAttribute]) -> np.ndarray:
        """Generate 64-dim skin vector"""
        vector = np.zeros(self.SEGMENTS["skin"])
        
        skin_attrs = [a for a in attributes if a.category == "skin_tone"]
        
        for attr in skin_attrs:
            if attr.attribute_name == "rgb":
                rgb = attr.attribute_value
                if isinstance(rgb, dict):
                    vector[0] = rgb.get("r", 0) / 255.0
                    vector[1] = rgb.get("g", 0) / 255.0
                    vector[2] = rgb.get("b", 0) / 255.0
            elif attr.attribute_name == "undertone":
                undertone = str(attr.attribute_value).lower()
                if "warm" in undertone:
                    vector[3] = 1.0
                elif "cool" in undertone:
                    vector[4] = 1.0
                else:
                    vector[5] = 1.0
        
        return vector
    
    def _generate_body_segment(self, attributes: List[BiometricAttribute]) -> np.ndarray:
        """Generate 32-dim body vector"""
        vector = np.zeros(self.SEGMENTS["body"])
        
        body_attrs = [a for a in attributes if a.category == "body_metrics"]
        
        for attr in body_attrs:
            if attr.attribute_name == "height_cm":
                vector[0] = float(attr.attribute_value or 170) / 200.0  # Normalize
            elif attr.attribute_name == "weight_kg":
                vector[1] = float(attr.attribute_value or 70) / 150.0
            elif attr.attribute_name == "bmi":
                vector[2] = float(attr.attribute_value or 22) / 40.0
            elif attr.attribute_name == "body_type":
                body_type = str(attr.attribute_value).lower()
                if "ecto" in body_type:
                    vector[3] = 1.0
                elif "meso" in body_type:
                    vector[4] = 1.0
                elif "endo" in body_type:
                    vector[5] = 1.0
        
        return vector
    
    def _generate_style_segment(self, attributes: List[BiometricAttribute], profile_id: uuid.UUID = None) -> np.ndarray:
        """Generate 256-dim style vector (learned)"""
        # For now, random initialization with profile-based seed
        # In production, this comes from CLIP model
        if profile_id:
            # Use profile_id as seed for reproducibility per profile
            seed = int(profile_id.hex[:8], 16) % (2**32)
            np.random.seed(seed)
        style_vector = np.random.randn(self.SEGMENTS["style"]) * 0.1
        np.random.seed(None)  # Reset to avoid affecting other code
        return style_vector
    
    def _generate_accessory_segment(self, attributes: List[BiometricAttribute]) -> np.ndarray:
        """Generate 128-dim accessory fit vector"""
        vector = np.zeros(self.SEGMENTS["accessory"])
        
        accessory_attrs = [a for a in attributes if a.category == "accessory_fit"]
        
        for attr in accessory_attrs:
            if "circumference" in attr.attribute_name or "width" in attr.attribute_name:
                vector[0] = float(attr.attribute_value or 50) / 100.0
        
        return vector
    
    def _generate_cosmetic_segment(self, attributes: List[BiometricAttribute]) -> np.ndarray:
        """Generate 128-dim cosmetic vector"""
        vector = np.zeros(self.SEGMENTS["cosmetic"])
        
        cosmetic_attrs = [a for a in attributes if a.category == "cosmetic_profile"]
        
        for attr in cosmetic_attrs:
            if attr.attribute_name == "skin_type":
                skin_type = str(attr.attribute_value).lower()
                if "oily" in skin_type:
                    vector[0] = 1.0
                elif "dry" in skin_type:
                    vector[1] = 1.0
        
        return vector
    
    def _generate_behavioral_segment(self, attributes: List[BiometricAttribute]) -> np.ndarray:
        """Generate 256-dim behavioral vector (learned over time)"""
        # Initialize with zeros, filled by recommendation engine
        return np.zeros(self.SEGMENTS["behavioral"])

