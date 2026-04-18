package com.ds3.ar

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Session
import com.google.ar.sceneform.ArSceneView

class MainActivity : AppCompatActivity() {

    private lateinit var arSceneView: ArSceneView
    private lateinit var arSession: Session
    private val CAMERA_PERMISSION_CODE = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        arSceneView = findViewById(R.id.ar_scene_view)

        if (checkCameraPermission()) {
            checkARCoreAvailability()
        } else {
            requestCameraPermission()
        }
    }

    private fun checkCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestCameraPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.CAMERA),
            CAMERA_PERMISSION_CODE
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                checkARCoreAvailability()
            } else {
                Toast.makeText(this, "Camera permission required", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun checkARCoreAvailability() {
        val availability = ArCoreApk.getInstance().checkAvailability(this)
        when (availability) {
            ArCoreApk.Availability.SUPPORTED_INSTALLED -> {
                setupARSession()
            }
            ArCoreApk.Availability.SUPPORTED_NOT_INSTALLED -> {
                ArCoreApk.getInstance().requestInstall(this, false) { result ->
                    if (result == ArCoreApk.InstallStatus.INSTALLED) {
                        setupARSession()
                    }
                }
            }
            else -> {
                Toast.makeText(this, "ARCore not supported", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupARSession() {
        try {
            arSession = Session(this)
            arSceneView.setupSession(arSession)
            arSceneView.start()
            setupBodyTracking()
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to setup AR session", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupBodyTracking() {
        // Setup ML Kit Pose Detection for body tracking
        // This will be implemented in the PoseDetector class
    }

    override fun onResume() {
        super.onResume()
        if (::arSession.isInitialized) {
            try {
                arSession.resume()
                arSceneView.resume()
            } catch (e: Exception) {
                Toast.makeText(this, "Failed to resume AR session", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onPause() {
        super.onPause()
        if (::arSession.isInitialized) {
            arSession.pause()
            arSceneView.pause()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::arSession.isInitialized) {
            arSession.close()
        }
    }
}
