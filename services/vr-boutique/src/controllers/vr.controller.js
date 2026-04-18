const VRSceneService = require('../services/vrScene.service');

class VRController {
  constructor() {
    this.vrSceneService = new VRSceneService();
  }

  async createRoom(req, res) {
    try {
      const { roomId, config } = req.body;
      const room = await this.vrSceneService.createRoom(roomId, config);
      res.json({ success: true, room });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async joinRoom(req, res) {
    try {
      const { roomId, userId, userProfile } = req.body;
      const result = await this.vrSceneService.joinRoom(roomId, userId, userProfile);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async leaveRoom(req, res) {
    try {
      const { roomId, userId } = req.body;
      await this.vrSceneService.leaveRoom(roomId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updatePosition(req, res) {
    try {
      const { roomId, userId, position, rotation } = req.body;
      const user = await this.vrSceneService.updateUserPosition(roomId, userId, position, rotation);
      const broadcast = await this.vrSceneService.broadcastPositionUpdate(roomId, userId, position, rotation);
      res.json({ success: true, user, broadcast });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getRoomUsers(req, res) {
    try {
      const { roomId } = req.params;
      const users = await this.vrSceneService.getRoomUsers(roomId);
      res.json({ success: true, users });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = VRController;
