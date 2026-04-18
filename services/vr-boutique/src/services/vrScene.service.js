const { VRScene, VRSession, VRUser } = require('../models/vr.models');

class VRSceneService {
  constructor() {
    this.activeSessions = new Map();
    this.activeRooms = new Map();
  }

  async createRoom(roomId, config) {
    const room = {
      id: roomId,
      name: config.name || 'Virtual Boutique',
      maxUsers: config.maxUsers || 10,
      currentUsers: 0,
      scene: config.scene || 'boutique_default',
      createdAt: new Date(),
      users: new Map()
    };

    this.activeRooms.set(roomId, room);
    return room;
  }

  async joinRoom(roomId, userId, userProfile) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.currentUsers >= room.maxUsers) {
      throw new Error('Room is full');
    }

    const user = {
      id: userId,
      profile: userProfile,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      avatarUrl: userProfile.avatarUrl,
      joinedAt: new Date()
    };

    room.users.set(userId, user);
    room.currentUsers++;

    return { room, user };
  }

  async leaveRoom(roomId, userId) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.users.delete(userId);
    room.currentUsers--;

    if (room.currentUsers === 0) {
      this.activeRooms.delete(roomId);
    }

    return true;
  }

  async updateUserPosition(roomId, userId, position, rotation) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const user = room.users.get(userId);
    if (!user) {
      throw new Error('User not found in room');
    }

    user.position = position;
    user.rotation = rotation;

    return user;
  }

  async getRoomUsers(roomId) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    return Array.from(room.users.values());
  }

  async broadcastPositionUpdate(roomId, userId, position, rotation) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      return;
    }

    // In production, this would use WebSocket to broadcast to all users
    return {
      type: 'position_update',
      userId,
      position,
      rotation,
      timestamp: new Date()
    };
  }
}

module.exports = VRSceneService;
