// Dungeon Raid WebSocket Management
// This handles real-time multiplayer unboxing rooms

export interface DungeonRoom {
  id: string;
  name: string;
  boxThemeId: string;
  maxPlayers: number;
  currentPlayers: number;
  players: DungeonPlayer[];
  status: 'waiting' | 'countdown' | 'unboxing' | 'completed';
  countdownSeconds?: number;
  startedAt?: Date;
  completedAt?: Date;
  bossLootWinner?: string;
}

export interface DungeonPlayer {
  id: string;
  username: string;
  avatar?: string;
  joinedAt: Date;
  isReady: boolean;
  rolledItems?: any[];
}

export interface DungeonRaidEvent {
  type: 'room_created' | 'player_joined' | 'player_left' | 'countdown_started' | 'countdown_tick' | 'unboxing_started' | 'unboxing_complete' | 'boss_loot_awarded';
  roomId: string;
  data: any;
  timestamp: Date;
}

class DungeonRaidManager {
  private rooms: Map<string, DungeonRoom> = new Map();
  private eventCallbacks: Set<(event: DungeonRaidEvent) => void> = new Set();
  private countdownIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Create a new dungeon raid room
  createRoom(boxThemeId: string, roomName?: string): DungeonRoom {
    const roomId = this.generateRoomId();
    const room: DungeonRoom = {
      id: roomId,
      name: roomName || `Dungeon Raid #${roomId.slice(-6)}`,
      boxThemeId,
      maxPlayers: 10,
      currentPlayers: 0,
      players: [],
      status: 'waiting'
    };

    this.rooms.set(roomId, room);
    this.broadcastEvent({
      type: 'room_created',
      roomId,
      data: room,
      timestamp: new Date()
    });

    return room;
  }

  // Player joins a room
  joinRoom(roomId: string, player: Omit<DungeonPlayer, 'joinedAt'>): { success: boolean; room?: DungeonRoom; error?: string } {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Room is not accepting players' };
    }

    if (room.currentPlayers >= room.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    // Check if player is already in room
    if (room.players.some(p => p.id === player.id)) {
      return { success: false, error: 'Player already in room' };
    }

    // Add player to room
    const newPlayer: DungeonPlayer = {
      ...player,
      joinedAt: new Date(),
      isReady: false
    };

    room.players.push(newPlayer);
    room.currentPlayers = room.players.length;

    // Check if room is now full
    if (room.currentPlayers === room.maxPlayers) {
      this.startCountdown(roomId);
    }

    this.broadcastEvent({
      type: 'player_joined',
      roomId,
      data: newPlayer,
      timestamp: new Date()
    });

    return { success: true, room };
  }

  // Player leaves a room
  leaveRoom(roomId: string, playerId: string): { success: boolean; room?: DungeonRoom; error?: string } {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status === 'unboxing' || room.status === 'completed') {
      return { success: false, error: 'Cannot leave room during unboxing' };
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return { success: false, error: 'Player not in room' };
    }

    const removedPlayer = room.players.splice(playerIndex, 1)[0];
    room.currentPlayers = room.players.length;

    // Cancel countdown if it was running
    if (room.status === 'countdown') {
      this.cancelCountdown(roomId);
      room.status = 'waiting';
    }

    // Clean up empty rooms
    if (room.currentPlayers === 0) {
      this.rooms.delete(roomId);
    }

    this.broadcastEvent({
      type: 'player_left',
      roomId,
      data: { playerId, username: removedPlayer.username },
      timestamp: new Date()
    });

    return { success: true, room };
  }

  // Start countdown when room is full
  private startCountdown(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'countdown';
    room.countdownSeconds = 10;
    room.startedAt = new Date();

    this.broadcastEvent({
      type: 'countdown_started',
      roomId,
      data: { countdownSeconds: room.countdownSeconds },
      timestamp: new Date()
    });

    // Start countdown timer
    const interval = setInterval(() => {
      const currentRoom = this.rooms.get(roomId);
      if (!currentRoom || currentRoom.countdownSeconds === undefined) {
        clearInterval(interval);
        return;
      }

      currentRoom.countdownSeconds--;

      this.broadcastEvent({
        type: 'countdown_tick',
        roomId,
        data: { countdownSeconds: currentRoom.countdownSeconds },
        timestamp: new Date()
      });

      if (currentRoom.countdownSeconds <= 0) {
        clearInterval(interval);
        this.startUnboxing(roomId);
      }
    }, 1000);

    this.countdownIntervals.set(roomId, interval);
  }

  // Cancel countdown
  private cancelCountdown(roomId: string) {
    const interval = this.countdownIntervals.get(roomId);
    if (interval) {
      clearInterval(interval);
      this.countdownIntervals.delete(roomId);
    }
  }

  // Start synchronized unboxing
  private async startUnboxing(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'unboxing';

    this.broadcastEvent({
      type: 'unboxing_started',
      roomId,
      data: { message: 'The dungeon raid begins!' },
      timestamp: new Date()
    });

    // Simulate unboxing process (in real app, this would call the probability engine)
    setTimeout(() => {
      this.completeUnboxing(roomId);
    }, 5000); // 5 second unboxing animation
  }

  // Complete unboxing and award boss loot
  private completeUnboxing(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Select random player for boss loot
    const randomPlayerIndex = Math.floor(Math.random() * room.players.length);
    const bossLootWinner = room.players[randomPlayerIndex];
    room.bossLootWinner = bossLootWinner.id;

    room.status = 'completed';
    room.completedAt = new Date();

    this.broadcastEvent({
      type: 'unboxing_complete',
      roomId,
      data: { 
        bossLootWinner: bossLootWinner.username,
        bossLootPlayerId: bossLootWinner.id
      },
      timestamp: new Date()
    });

    // Clean up room after delay
    setTimeout(() => {
      this.rooms.delete(roomId);
    }, 30000); // Keep room for 30 seconds for results display
  }

  // Get room by ID
  getRoom(roomId: string): DungeonRoom | undefined {
    return this.rooms.get(roomId);
  }

  // Get all active rooms
  getActiveRooms(): DungeonRoom[] {
    return Array.from(this.rooms.values()).filter(room => room.status !== 'completed');
  }

  // Get available rooms (waiting for players)
  getAvailableRooms(): DungeonRoom[] {
    return Array.from(this.rooms.values()).filter(room => 
      room.status === 'waiting' && room.currentPlayers < room.maxPlayers
    );
  }

  // Subscribe to events
  onEvent(callback: (event: DungeonRaidEvent) => void): () => void {
    this.eventCallbacks.add(callback);
    return () => this.eventCallbacks.delete(callback);
  }

  // Broadcast event to all subscribers
  private broadcastEvent(event: DungeonRaidEvent) {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error broadcasting event:', error);
      }
    });
  }

  // Generate unique room ID
  private generateRoomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Get room statistics
  getRoomStats(roomId: string): {
    totalPlayers: number;
    averageWaitTime: number;
    completionRate: number;
  } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const waitTimes = room.players.map(player => 
      room.startedAt ? room.startedAt.getTime() - player.joinedAt.getTime() : 0
    );

    return {
      totalPlayers: room.players.length,
      averageWaitTime: waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0,
      completionRate: room.status === 'completed' ? 100 : room.status === 'unboxing' ? 50 : 0
    };
  }
}

// Singleton instance
export const dungeonRaidManager = new DungeonRaidManager();

// WebSocket connection handler (for Next.js API route)
export function handleDungeonRaidWebSocket(ws: any, roomId: string, playerId: string) {
  const unsubscribe = dungeonRaidManager.onEvent((event) => {
    if (event.roomId === roomId) {
      ws.send(JSON.stringify(event));
    }
  });

  ws.on('close', () => {
    unsubscribe();
    // Handle player disconnect
    dungeonRaidManager.leaveRoom(roomId, playerId);
  });

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);
      // Handle different message types
      switch (message.type) {
        case 'join_room':
          const joinResult = dungeonRaidManager.joinRoom(roomId, message.player);
          ws.send(JSON.stringify({ type: 'join_result', data: joinResult }));
          break;
        case 'leave_room':
          const leaveResult = dungeonRaidManager.leaveRoom(roomId, playerId);
          ws.send(JSON.stringify({ type: 'leave_result', data: leaveResult }));
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
}
