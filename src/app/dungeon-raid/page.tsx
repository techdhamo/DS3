'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sword, Crown, Timer, Sparkles, Shield, Zap, DoorOpen, Plus, LogIn } from 'lucide-react';
import Link from 'next/link';

// Types
interface DungeonRoom {
  id: string;
  name: string;
  boxThemeId: string;
  maxPlayers: number;
  currentPlayers: number;
  players: DungeonPlayer[];
  status: 'waiting' | 'countdown' | 'unboxing' | 'completed';
  countdownSeconds?: number;
  bossLootWinner?: string;
}

interface DungeonPlayer {
  id: string;
  username: string;
  avatar?: string | null;
  joinedAt: Date;
  isReady: boolean;
}

export default function DungeonRaidPage() {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<DungeonRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<DungeonRoom | null>(null);
  const [userMana, setUserMana] = useState(2450); // Mock user Mana balance
  const [currentPlayer, setCurrentPlayer] = useState({
    id: session?.user?.email || 'guest-' + Math.random().toString(36).substr(2, 9),
    username: session?.user?.name || 'GuestPlayer' + Math.floor(Math.random() * 1000),
    avatar: null
  });

  const ENTRY_FEE = 500; // 500 Mana to join a raid

  // Mock data for development
  const mockRooms: DungeonRoom[] = [
    {
      id: 'dungeon-123',
      name: 'Dragon\'s Lair Raid',
      boxThemeId: 'dark-wizard-desk',
      maxPlayers: 10,
      currentPlayers: 7,
      players: [
        { id: '1', username: 'DragonSlayer99', avatar: null, joinedAt: new Date(), isReady: true },
        { id: '2', username: 'MagicUser', avatar: null, joinedAt: new Date(), isReady: true },
        { id: '3', username: 'RogueNinja', avatar: null, joinedAt: new Date(), isReady: false },
        { id: '4', username: 'PaladinMike', avatar: null, joinedAt: new Date(), isReady: true },
        { id: '5', username: 'WizardSarah', avatar: null, joinedAt: new Date(), isReady: true },
        { id: '6', username: 'RangerTom', avatar: null, joinedAt: new Date(), isReady: false },
        { id: '7', username: 'BardLisa', avatar: null, joinedAt: new Date(), isReady: true }
      ],
      status: 'waiting'
    },
    {
      id: 'dungeon-456',
      name: 'Dark Wizard\'s Tower',
      boxThemeId: 'dark-wizard-desk',
      maxPlayers: 10,
      currentPlayers: 3,
      players: [
        { id: '8', username: 'KnightDave', avatar: null, joinedAt: new Date(), isReady: true },
        { id: '9', username: 'SorceressEmma', avatar: null, joinedAt: new Date(), isReady: true },
        { id: '10', username: 'DruidAlex', avatar: null, joinedAt: new Date(), isReady: false }
      ],
      status: 'waiting'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRooms(mockRooms);
      setLoading(false);
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setRooms(prev => prev.map(room => {
        if (room.status === 'countdown' && room.countdownSeconds !== undefined) {
          const newCountdown = room.countdownSeconds - 1;
          if (newCountdown <= 0) {
            return { ...room, status: 'unboxing' as const, countdownSeconds: undefined };
          }
          return { ...room, countdownSeconds: newCountdown };
        }
        return room;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = (room: DungeonRoom) => {
    // Check if user is authenticated
    if (!session) {
      // Redirect to sign in
      return;
    }

    // Check if user has enough Mana
    if (userMana < ENTRY_FEE) {
      alert(`Not enough Mana! You need ${ENTRY_FEE} Mana to join a raid. Purchase mystery boxes to earn more Mana!`);
      return;
    }

    // Deduct entry fee
    setUserMana(prev => prev - ENTRY_FEE);

    // Simulate joining room
    const updatedRoom = {
      ...room,
      currentPlayers: room.currentPlayers + 1,
      players: [...room.players, { ...currentPlayer, joinedAt: new Date(), isReady: true }]
    };
    
    setRooms(prev => prev.map(r => r.id === room.id ? updatedRoom : r));
    setSelectedRoom(updatedRoom);

    // Check if room is now full
    if (updatedRoom.currentPlayers === updatedRoom.maxPlayers) {
      setTimeout(() => {
        setRooms(prev => prev.map(r => 
          r.id === room.id ? { ...r, status: 'countdown' as const, countdownSeconds: 10 } : r
        ));
      }, 2000);
    }
  };

  const handleLeaveRoom = (room: DungeonRoom) => {
    const updatedRoom = {
      ...room,
      currentPlayers: room.currentPlayers - 1,
      players: room.players.filter(p => p.id !== currentPlayer.id)
    };
    
    setRooms(prev => prev.map(r => r.id === room.id ? updatedRoom : r));
    setSelectedRoom(null);
  };

  const handleCreateRoom = () => {
    const newRoom: DungeonRoom = {
      id: 'dungeon-' + Math.random().toString(36).substr(2, 9),
      name: `Dungeon Raid #${Math.floor(Math.random() * 1000)}`,
      boxThemeId: 'dark-wizard-desk',
      maxPlayers: 10,
      currentPlayers: 0,
      players: [],
      status: 'waiting'
    };

    setRooms(prev => [...prev, newRoom]);
    handleJoinRoom(newRoom);
  };

  const getStatusColor = (status: DungeonRoom['status']) => {
    switch (status) {
      case 'waiting': return 'text-green-400';
      case 'countdown': return 'text-yellow-400';
      case 'unboxing': return 'text-purple-400';
      case 'completed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: DungeonRoom['status']) => {
    switch (status) {
      case 'waiting': return 'Waiting for Heroes';
      case 'countdown': return 'R Starting Soon';
      case 'unboxing': return 'Battle in Progress';
      case 'completed': return 'Quest Complete';
      default: return 'Unknown';
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <LogIn className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-gray-300 mb-6">
              You must be signed in to join Dungeon Raids and use your Mana points.
            </p>
            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all inline-block"
            >
              Sign In to Play
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sword className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Dungeon Raids
            </h1>
            <Sword className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Join forces with 9 other heroes for a chance at epic loot! 
            One lucky raider will receive the Boss Treasure.
          </p>
          
          {/* Mana Balance Display */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Your Mana:</span>
              <span className="text-2xl font-bold text-purple-400">{userMana.toLocaleString()}</span>
              <span className="text-gray-400 text-sm">({ENTRY_FEE} to join)</span>
            </div>
          </div>
        </motion.div>

        {/* Current Player Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-xl p-6 mb-8 max-w-md mx-auto"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold">{currentPlayer.username}</div>
              <div className="text-gray-400 text-sm">Ready for adventure</div>
            </div>
          </div>
        </motion.div>

        {/* Create Room Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleCreateRoom}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center gap-3 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create New Raid
          </button>
        </motion.div>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl overflow-hidden"
            >
              {/* Room Header */}
              <div className="p-6 border-b border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{room.name}</h3>
                  <div className={`flex items-center gap-2 ${getStatusColor(room.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      room.status === 'waiting' ? 'bg-green-400' :
                      room.status === 'countdown' ? 'bg-yellow-400 animate-pulse' :
                      room.status === 'unboxing' ? 'bg-purple-400 animate-pulse' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm font-semibold">{getStatusText(room.status)}</span>
                  </div>
                </div>

                {/* Players Count */}
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{room.currentPlayers}/{room.maxPlayers}</span>
                  </div>
                  {room.status === 'countdown' && room.countdownSeconds && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Timer className="w-4 h-4" />
                      <span>{room.countdownSeconds}s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Players List */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {room.players.slice(0, 6).map((player) => (
                    <div key={player.id} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        player.isReady ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <span className="text-gray-300 truncate">{player.username}</span>
                    </div>
                  ))}
                  {room.players.length > 6 && (
                    <div className="text-sm text-gray-400">
                      +{room.players.length - 6} more
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {room.status === 'waiting' && (
                  <button
                    onClick={() => room.players.some(p => p.id === currentPlayer.id) 
                      ? handleLeaveRoom(room) 
                      : handleJoinRoom(room)}
                    disabled={room.currentPlayers >= room.maxPlayers && !room.players.some(p => p.id === currentPlayer.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      room.players.some(p => p.id === currentPlayer.id)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : room.currentPlayers >= room.maxPlayers
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : userMana < ENTRY_FEE
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    {room.players.some(p => p.id === currentPlayer.id) ? (
                      <>
                        <DoorOpen className="w-4 h-4 inline mr-2" />
                        Leave Raid
                      </>
                    ) : room.currentPlayers >= room.maxPlayers ? (
                      'Room Full'
                    ) : userMana < ENTRY_FEE ? (
                      <>
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Need {ENTRY_FEE} Mana
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 inline mr-2" />
                        Join Raid ({ENTRY_FEE} Mana)
                      </>
                    )}
                  </button>
                )}

                {room.status === 'countdown' && (
                  <div className="text-center text-yellow-400 font-semibold">
                    <Timer className="w-5 h-5 inline mr-2 animate-pulse" />
                    Starting in {room.countdownSeconds}s...
                  </div>
                )}

                {room.status === 'unboxing' && (
                  <div className="text-center text-purple-400 font-semibold">
                    <Sparkles className="w-5 h-5 inline mr-2 animate-pulse" />
                    Battle in Progress
                  </div>
                )}

                {room.status === 'completed' && (
                  <div className="text-center text-gray-400">
                    <Crown className="w-5 h-5 inline mr-2" />
                    Quest Complete
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {rooms.length === 0 && (
          <div className="text-center py-16">
            <Sword className="w-24 h-24 text-purple-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No Active Raids</h3>
            <p className="text-gray-300 mb-6">Be the first to start a dungeon raid!</p>
            <button
              onClick={handleCreateRoom}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Create First Raid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
