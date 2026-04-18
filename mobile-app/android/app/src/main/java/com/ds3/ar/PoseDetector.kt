package com.ds3.ar

import android.content.Context
import android.graphics.Bitmap
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseDetection
import com.google.mlkit.vision.pose.PoseDetector
import com.google.mlkit.vision.pose.PoseDetectorOptions
import com.google.mlkit.vision.pose.defaults.PoseDetectionOptions

class PoseDetector(private val context: Context) {

    private val options: PoseDetectorOptions = PoseDetectionOptions.Builder()
        .setDetectorMode(PoseDetectionOptions.STREAM_MODE)
        .build()

    private val poseDetector: PoseDetector = PoseDetection.getClient(options)

    fun detectPose(bitmap: Bitmap, callback: (Pose?) -> Unit) {
        val image = InputImage.fromBitmap(bitmap, 0)
        
        poseDetector.process(image)
            .addOnSuccessListener { pose ->
                callback(pose)
            }
            .addOnFailureListener { e ->
                callback(null)
            }
    }

    fun extractBodyMeasurements(pose: Pose): BodyMeasurements {
        val landmarks = pose.allPoseLandmarks
        
        val leftShoulder = landmarks.find { it.landmarkType == 11 }
        val rightShoulder = landmarks.find { it.landmarkType == 12 }
        val leftHip = landmarks.find { it.landmarkType == 23 }
        val rightHip = landmarks.find { it.landmarkType == 24 }
        val leftAnkle = landmarks.find { it.landmarkType == 27 }
        val rightAnkle = landmarks.find { it.landmarkType == 28 }

        val shoulderWidth = calculateDistance(leftShoulder, rightShoulder)
        val hipWidth = calculateDistance(leftHip, rightHip)
        val height = calculateHeight(leftShoulder, leftAnkle)

        return BodyMeasurements(
            heightCm = height * 100,
            shoulderWidthCm = shoulderWidth * 100,
            hipWidthCm = hipWidth * 100
        )
    }

    private fun calculateDistance(landmark1: com.google.mlkit.vision.pose.PoseLandmark?, landmark2: com.google.mlkit.vision.pose.PoseLandmark?): Float {
        if (landmark1 == null || landmark2 == null) return 0f
        
        val dx = landmark1.position.x - landmark2.position.x
        val dy = landmark1.position.y - landmark2.position.y
        val dz = landmark1.position.z - landmark2.position.z
        
        return Math.sqrt((dx * dx + dy * dy + dz * dz).toDouble()).toFloat()
    }

    private fun calculateHeight(shoulder: com.google.mlkit.vision.pose.PoseLandmark?, ankle: com.google.mlkit.vision.pose.PoseLandmark?): Float {
        if (shoulder == null || ankle == null) return 0f
        return Math.abs(shoulder.position.y - ankle.position.y)
    }

    fun close() {
        poseDetector.close()
    }
}

data class BodyMeasurements(
    val heightCm: Float,
    val shoulderWidthCm: Float,
    val hipWidthCm: Float
)
