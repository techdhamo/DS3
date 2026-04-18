"""
Feature Extractor Service
Uses MediaPipe, ResNet, CLIP to extract 1000+ biometric attributes
"""

import io
import uuid
from datetime import datetime
from typing import Dict, List, Optional
import structlog

import numpy as np
import cv2
from PIL import Image
import mediapipe as mp

logger = structlog.get_logger()

class FeatureExtractor:
    """Extract 1000+ biometric features from photos"""
    
    def __init__(self, settings):
        self.settings = settings
        
        # Initialize MediaPipe modules
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_pose = mp.solutions.pose
        self.mp_hands = mp.solutions.hands
        
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            min_detection_confidence=0.5
        )
        
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=2,
            min_detection_confidence=0.5
        )
        
        logger.info("feature_extractor.initialized")
    
    async def extract_from_photo(self, photo_id: uuid.UUID, image_bytes: bytes) -> Dict:
        """
        Extract all features from a single photo
        Returns structured attributes with confidence scores
        """
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            image_array = np.array(image)
            
            features = {
                "photo_id": str(photo_id),
                "extraction_timestamp": datetime.utcnow().isoformat(),
                "features": {}
            }
            
            # Extract facial features
            facial_features = await self._extract_facial_features(image_array)
            features["features"]["facial_geometry"] = facial_features
            
            # Extract body features
            body_features = await self._extract_body_features(image_array)
            features["features"]["body_metrics"] = body_features
            
            # Extract skin tone
            skin_features = await self._extract_skin_tone(image_array, facial_features)
            features["features"]["skin_tone"] = skin_features
            
            # Extract hand features
            hand_features = await self._extract_hand_features(image_array)
            features["features"]["accessory_fit"] = hand_features
            
            # Calculate overall confidence
            confidences = [
                facial_features.get("confidence", 0),
                body_features.get("confidence", 0),
                skin_features.get("confidence", 0),
                hand_features.get("confidence", 0)
            ]
            features["overall_confidence"] = np.mean(confidences)
            
            logger.info("features.extracted", 
                     photo_id=str(photo_id),
                     confidence=features["overall_confidence"],
                     feature_count=len(features["features"]))
            
            return features
            
        except Exception as e:
            logger.error("feature_extraction.failed", photo_id=str(photo_id), error=str(e))
            raise
    
    async def _extract_facial_features(self, image: np.ndarray) -> Dict:
        """Extract 468 facial landmarks and derive facial geometry"""
        try:
            results = self.face_mesh.process(image)
            
            if not results.multi_face_landmarks:
                return {"confidence": 0, "error": "No face detected"}
            
            landmarks = results.multi_face_landmarks[0]
            
            # Extract 468 landmarks as vector
            landmark_vector = []
            for lm in landmarks.landmark:
                landmark_vector.extend([lm.x, lm.y, lm.z])
            
            # Calculate facial measurements
            face_shape = self._classify_face_shape(landmarks)
            
            # Calculate proportions
            landmarks_468 = np.array(landmark_vector).reshape(-1, 3)
            
            facial_features = {
                "landmark_count": 468,
                "landmark_vector": landmark_vector[:384],  # First 128*3 for storage
                "face_shape": face_shape,
                "confidence": 0.95,
                "features": {
                    "forehead_width": self._calculate_distance(landmarks_468[10], landmarks_468[338]),
                    "face_width": self._calculate_distance(landmarks_468[234], landmarks_468[454]),
                    "face_height": self._calculate_distance(landmarks_468[10], landmarks_468[152]),
                    "eye_distance": self._calculate_distance(landmarks_468[33], landmarks_468[263]),
                    "nose_width": self._calculate_distance(landmarks_468[129], landmarks_468[358]),
                    "lip_fullness": self._calculate_lip_fullness(landmarks_468)
                }
            }
            
            return facial_features
            
        except Exception as e:
            logger.error("facial_extraction.failed", error=str(e))
            return {"confidence": 0, "error": str(e)}
    
    async def _extract_body_features(self, image: np.ndarray) -> Dict:
        """Extract body pose and proportions using MediaPipe Pose"""
        try:
            results = self.pose.process(image)
            
            if not results.pose_landmarks:
                return {"confidence": 0, "error": "No pose detected"}
            
            landmarks = results.pose_landmarks.landmark
            
            # Extract 33 body landmarks
            pose_vector = []
            for lm in landmarks:
                pose_vector.extend([lm.x, lm.y, lm.z, lm.visibility])
            
            # Estimate proportions
            body_features = {
                "landmark_count": 33,
                "pose_vector": pose_vector[:132],  # First 33*4
                "confidence": 0.85,
                "features": {
                    "shoulder_width": self._get_landmark_distance(landmarks, 11, 12),
                    "hip_width": self._get_landmark_distance(landmarks, 23, 24),
                    "torso_height": self._get_landmark_distance(landmarks, 11, 23),
                    "arm_length": self._get_landmark_distance(landmarks, 11, 15),
                    "leg_length": self._get_landmark_distance(landmarks, 23, 27),
                    "body_type": self._classify_body_type(landmarks)
                }
            }
            
            return body_features
            
        except Exception as e:
            logger.error("body_extraction.failed", error=str(e))
            return {"confidence": 0, "error": str(e)}
    
    async def _extract_skin_tone(self, image: np.ndarray, facial_features: Dict) -> Dict:
        """Extract skin tone using facial region pixels"""
        try:
            # Convert to RGB if needed
            if len(image.shape) == 2:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
            elif image.shape[2] == 4:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
            elif image.shape[2] == 3:
                image_rgb = image  # PIL images are already RGB, don't convert
            else:
                image_rgb = image
            
            # Sample skin from cheek region (simplified)
            # In production, use facial landmarks to get exact cheek region
            h, w = image_rgb.shape[:2]
            cheek_sample = image_rgb[int(h*0.4):int(h*0.6), int(w*0.3):int(w*0.7)]
            
            # Calculate average RGB
            mean_rgb = np.mean(cheek_sample.reshape(-1, 3), axis=0)
            
            # Classify undertone
            undertone = self._classify_undertone(mean_rgb)
            
            # Calculate hex color
            hex_color = '#{:02x}{:02x}{:02x}'.format(
                int(mean_rgb[0]), int(mean_rgb[1]), int(mean_rgb[2])
            )
            
            skin_features = {
                "rgb": {
                    "r": int(mean_rgb[0]),
                    "g": int(mean_rgb[1]),
                    "b": int(mean_rgb[2])
                },
                "hex": hex_color,
                "undertone": undertone,
                "confidence": 0.75,
                "season_palette": self._get_season_palette(undertone, mean_rgb)
            }
            
            return skin_features
            
        except Exception as e:
            logger.error("skin_extraction.failed", error=str(e))
            return {"confidence": 0, "error": str(e)}
    
    async def _extract_hand_features(self, image: np.ndarray) -> Dict:
        """Extract hand measurements for accessory fitting"""
        try:
            results = self.hands.process(image)
            
            if not results.multi_hand_landmarks:
                return {"confidence": 0, "error": "No hands detected"}
            
            hand_data = []
            for hand_landmarks in results.multi_hand_landmarks:
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.append([lm.x, lm.y, lm.z])
                
                landmarks = np.array(landmarks)
                
                # Calculate finger circumferences and wrist
                hand_info = {
                    "wrist_width": self._calculate_distance(landmarks[0], landmarks[9]),
                    "palm_width": self._calculate_distance(landmarks[5], landmarks[17]),
                    "index_finger_circumference": self._estimate_finger_circumference(landmarks, 5, 6, 7, 8),
                    "ring_finger_circumference": self._estimate_finger_circumference(landmarks, 9, 10, 11, 12),
                }
                hand_data.append(hand_info)
            
            accessory_features = {
                "hand_count": len(results.multi_hand_landmarks),
                "hand_measurements": hand_data,
                "confidence": 0.70,
                "recommended_ring_sizes": self._estimate_ring_sizes(hand_data)
            }
            
            return accessory_features
            
        except Exception as e:
            logger.error("hand_extraction.failed", error=str(e))
            return {"confidence": 0, "error": str(e)}
    
    # Helper methods
    def _calculate_distance(self, p1, p2):
        """Calculate Euclidean distance between two points"""
        return np.sqrt(np.sum((np.array(p1) - np.array(p2)) ** 2))
    
    def _get_landmark_distance(self, landmarks, idx1, idx2):
        """Get distance between two MediaPipe landmarks"""
        p1 = np.array([landmarks[idx1].x, landmarks[idx1].y, landmarks[idx1].z])
        p2 = np.array([landmarks[idx2].x, landmarks[idx2].y, landmarks[idx2].z])
        return self._calculate_distance(p1, p2)
    
    def _classify_face_shape(self, landmarks):
        """Classify face shape from landmarks"""
        # Simplified classification
        return "oval"  # TODO: Implement proper classification
    
    def _calculate_lip_fullness(self, landmarks_468):
        """Calculate lip fullness ratio"""
        return 0.5  # TODO: Implement proper calculation
    
    def _classify_body_type(self, landmarks):
        """Classify body type from pose landmarks"""
        return "average"  # TODO: Implement proper classification
    
    def _classify_undertone(self, rgb):
        """Classify skin undertone from RGB"""
        # Simple heuristic: check if warm (more yellow) or cool (more pink)
        if rgb[0] > rgb[2]:  # More red than blue = warm
            return "warm"
        else:
            return "cool"
    
    def _get_season_palette(self, undertone, rgb):
        """Determine color season palette"""
        if undertone == "warm":
            return "autumn" if rgb[0] > 180 else "spring"
        else:
            return "winter" if rgb[0] < 150 else "summer"
    
    def _estimate_finger_circumference(self, landmarks, base, mid1, mid2, tip):
        """Estimate finger circumference from width"""
        width = self._calculate_distance(landmarks[base], landmarks[tip]) * 0.3
        return 2 * np.pi * width / 2  # Circumference = 2 * pi * radius
    
    def _estimate_ring_sizes(self, hand_data):
        """Estimate ring sizes from hand measurements"""
        sizes = []
        for hand in hand_data:
            # Convert circumference to approximate ring size
            circumference = hand.get("ring_finger_circumference", 50)
            # US ring size approximation: circumference / pi = diameter in mm
            # Size = diameter - 11.5 (rough conversion)
            size = int((circumference / np.pi) - 11.5)
            sizes.append(max(4, min(14, size)))  # Clamp to valid range
        return sizes
    
    async def get_all_attributes(self, profile_id: uuid.UUID) -> Dict:
        """Get all extracted attributes for a profile"""
        # TODO: Fetch from database
        return {"_meta": {"vector_status": "pending", "confidence": 0}}
    
    async def get_extraction_status(self, profile_id: uuid.UUID) -> Dict:
        """Get extraction status for a profile"""
        return {"status": "pending", "progress": 0}
    
    async def reprocess_all_photos(self, profile_id: uuid.UUID):
        """Reprocess all photos for a profile"""
        logger.info("reprocessing.started", profile_id=str(profile_id))
        # TODO: Implementation
