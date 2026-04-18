import UIKit
import ARKit
import RealityKit

class ViewController: UIViewController {
    
    @IBOutlet var arView: ARView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupARSession()
        setupBodyTracking()
        setupGestures()
    }
    
    func setupARSession() {
        let configuration = ARBodyTrackingConfiguration()
        configuration.automaticSkeletonScaleCorrectionEnabled = true
        arView.session.run(configuration)
    }
    
    func setupBodyTracking() {
        arView.session.delegate = self
    }
    
    func setupGestures() {
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        arView.addGestureRecognizer(tapGesture)
    }
    
    @objc func handleTap(_ gesture: UITapGestureRecognizer) {
        let location = gesture.location(in: arView)
        let hitResults = arView.raycast(from: location, allowing: .estimatedPlane, alignment: .any)
        
        if let hitResult = hitResults.first {
            placeProduct(at: hitResult.worldTransform)
        }
    }
    
    func placeProduct(at transform: simd_float4x4) {
        // Create a 3D model of a clothing item
        let anchor = ARAnchor(name: "clothing_item", transform: transform)
        arView.session.add(anchor: anchor)
    }
}

extension ViewController: ARSessionDelegate {
    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        for anchor in anchors {
            if let bodyAnchor = anchor as? ARBodyAnchor {
                updateBodyPose(bodyAnchor)
            }
        }
    }
    
    func updateBodyPose(_ bodyAnchor: ARBodyAnchor) {
        // Get skeleton joints
        let skeleton = bodyAnchor.skeleton.model
        
        // Extract body measurements
        let height = calculateHeight(from: skeleton)
        let shoulderWidth = calculateShoulderWidth(from: skeleton)
        
        // Send to matching engine for product recommendations
        sendBodyMeasurements(height: height, shoulderWidth: shoulderWidth)
    }
    
    func calculateHeight(from skeleton: ARSkeleton3D) -> Float {
        // Calculate height from head to feet
        guard let head = skeleton.definition.index(forJointNamed: "head"),
              let leftFoot = skeleton.definition.index(forJointNamed: "left_foot") else {
            return 0
        }
        
        let headPosition = skeleton.modelTransform(forJointIndex: head).columns.3
        let footPosition = skeleton.modelTransform(forJointIndex: leftFoot).columns.3
        
        return abs(headPosition.y - footPosition.y)
    }
    
    func calculateShoulderWidth(from skeleton: ARSkeleton3D) -> Float {
        // Calculate shoulder width
        guard let leftShoulder = skeleton.definition.index(forJointNamed: "left_shoulder"),
              let rightShoulder = skeleton.definition.index(forJointNamed: "right_shoulder") else {
            return 0
        }
        
        let leftPos = skeleton.modelTransform(forJointIndex: leftShoulder).columns.3
        let rightPos = skeleton.modelTransform(forJointIndex: rightShoulder).columns.3
        
        return abs(leftPos.x - rightPos.x)
    }
    
    func sendBodyMeasurements(height: Float, shoulderWidth: Float) {
        // Send measurements to backend API
        let url = URL(string: "https://api.ds3.com/v1/profile/body-measurements")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "height_cm": height,
            "shoulder_width_cm": shoulderWidth,
            "source": "arkit"
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            // Handle response
        }.resume()
    }
}
