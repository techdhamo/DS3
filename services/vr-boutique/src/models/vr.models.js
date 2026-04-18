const VRScene = {
  id: String,
  name: String,
  type: String, // 'boutique', 'showroom', 'custom'
  sceneUrl: String,
  thumbnailUrl: String,
  products: Array,
  createdAt: Date,
  updatedAt: Date
};

const VRSession = {
  id: String,
  userId: String,
  roomId: String,
  deviceId: String,
  platform: String, // 'quest', 'psvr2', 'webxr'
  status: String, // 'active', 'idle', 'disconnected'
  position: { x: Number, y: Number, z: Number },
  rotation: { x: Number, y: Number, z: Number },
  handTrackingEnabled: Boolean,
  voiceChatEnabled: Boolean,
  createdAt: Date,
  lastActiveAt: Date
};

const VRUser = {
  id: String,
  profileId: String,
  displayName: String,
  avatarUrl: String,
  handTracking: Boolean,
  voiceEnabled: Boolean
};

module.exports = { VRScene, VRSession, VRUser };
