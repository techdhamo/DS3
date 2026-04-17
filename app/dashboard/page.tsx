'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Crown, 
  Shield, 
  Sword, 
  Sparkles, 
  Package, 
  Users, 
  TrendingUp, 
  LogOut,
  Settings,
  Gift,
  Star,
  Gem
} from 'lucide-react';
import Link from 'next/link';

// Mock user data
const mockUserData = {
  id: 'user-123',
  username: 'DragonSlayer99',
  email: 'player@example.com',
  guildRank: 'MASTER_COLLECTOR' as const,
  loyaltyPoints: 2450,
  totalSpent: 299.97,
  boxesOpened: 12,
  rareItemsWon: 3,
  inventory: [
    {
      id: 'item-1',
      name: 'Amethyst Crystal',
      rarityTier: 'COMMON' as const,
      quantity: 3,
      acquiredAt: new Date('2024-01-15')
    },
    {
      id: 'item-2',
      name: 'Dragon Scale Fragment',
      rarityTier: 'RARE' as const,
      quantity: 1,
      acquiredAt: new Date('2024-01-14')
    },
    {
      id: 'item-3',
      name: 'Crystal Ball Orb',
      rarityTier: 'EPIC' as const,
      quantity: 1,
      acquiredAt: new Date('2024-01-13')
    },
    {
      id: 'item-4',
      name: 'Ancient Spell Tome',
      rarityTier: 'MYTHIC' as const,
      quantity: 1,
      acquiredAt: new Date('2024-01-12')
    }
  ],
  recentOrders: [
    {
      id: 'order-1',
      boxThemeName: "The Dark Wizard's Desk",
      totalAmount: 49.99,
      status: 'DELIVERED' as const,
      createdAt: new Date('2024-01-15'),
      rolledItems: ['Amethyst Crystal', 'Dragon Scale Fragment']
    },
    {
      id: 'order-2',
      boxThemeName: "Dragon's Lair Hoard",
      totalAmount: 79.99,
      status: 'PROCESSING' as const,
      createdAt: new Date('2024-01-14'),
      rolledItems: ['Crystal Ball Orb']
    }
  ]
};

const guildRankConfig = {
  NOVICE: { name: 'Novice', color: 'text-gray-400', bgColor: 'bg-gray-900/50', icon: Shield, requiredPoints: 0 },
  APPRENTICE: { name: 'Apprentice', color: 'text-green-400', bgColor: 'bg-green-900/50', icon: Sparkles, requiredPoints: 100 },
  TREASURE_HUNTER: { name: 'Treasure Hunter', color: 'text-blue-400', bgColor: 'bg-blue-900/50', icon: Package, requiredPoints: 500 },
  MASTER_COLLECTOR: { name: 'Master Collector', color: 'text-purple-400', bgColor: 'bg-purple-900/50', icon: Crown, requiredPoints: 1000 },
  LEGENDARY: { name: 'Legendary', color: 'text-orange-400', bgColor: 'bg-orange-900/50', icon: Star, requiredPoints: 2500 }
};

const rarityConfig = {
  COMMON: { color: 'text-gray-400', bgColor: 'bg-gray-900/50', borderColor: 'border-gray-600' },
  RARE: { color: 'text-blue-400', bgColor: 'bg-blue-900/50', borderColor: 'border-blue-600' },
  EPIC: { color: 'text-purple-400', bgColor: 'bg-purple-900/50', borderColor: 'border-purple-600' },
  LEGENDARY: { color: 'text-orange-400', bgColor: 'bg-orange-900/50', borderColor: 'border-orange-600' },
  MYTHIC: { color: 'text-pink-400', bgColor: 'bg-pink-900/50', borderColor: 'border-pink-600' }
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-300 mb-8">Please sign in to access your dashboard</p>
          <Link 
            href="/auth/signin"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Use mock data for guild rank until we wire up real database
  const mockGuildRank = 'NOVICE';
  const mockLoyaltyPoints = 0;
  
  const currentRank = guildRankConfig[mockGuildRank as keyof typeof guildRankConfig];
  const RankIcon = currentRank.icon;
  const nextRank = Object.values(guildRankConfig).find(rank => rank.requiredPoints > mockLoyaltyPoints);
  const progressToNext = nextRank ? 
    ((mockLoyaltyPoints - currentRank.requiredPoints) / (nextRank.requiredPoints - currentRank.requiredPoints)) * 100 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors">
              <Sword className="w-6 h-6" />
              <span className="font-bold">DS3 World</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-purple-500/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-500/50 flex items-center justify-center text-white font-bold">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-right">
                <div className="text-white font-semibold">{session?.user?.name || 'Player'}</div>
                <div className="text-sm text-gray-400">{session?.user?.email}</div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Player Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar and Rank */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                <RankIcon className="w-12 h-12 text-white" />
              </div>
              <div className={`px-4 py-2 rounded-full ${currentRank.bgColor} border border-purple-500/50`}>
                <span className={`font-bold ${currentRank.color}`}>{currentRank.name}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{mockLoyaltyPoints.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Mana Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">$0.00</div>
                <div className="text-sm text-gray-400">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">0</div>
                <div className="text-sm text-gray-400">Boxes Opened</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">0</div>
                <div className="text-sm text-gray-400">Rare Items</div>
              </div>
            </div>

            {/* Progress to Next Rank */}
            {nextRank && (
              <div className="w-full md:w-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">Progress to {nextRank.name}</span>
                  <span className="text-sm text-purple-400">{Math.round(progressToNext)}%</span>
                </div>
                <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {mockLoyaltyPoints} / {nextRank.requiredPoints} points
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Link href="/store" className="group">
            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all">
              <Package className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-bold mb-2">Browse Store</h3>
              <p className="text-gray-400 text-sm">Discover new mystery boxes</p>
            </div>
          </Link>

          <Link href="/dungeon-raid" className="group">
            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all">
              <Users className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-bold mb-2">Join Dungeon Raid</h3>
              <p className="text-gray-400 text-sm">Team up for epic loot</p>
            </div>
          </Link>

          <div className="group">
            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all">
              <Settings className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-bold mb-2">Settings</h3>
              <p className="text-gray-400 text-sm">Manage your account</p>
            </div>
          </div>
        </motion.div>

        {/* Inventory and Orders */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inventory */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-400" />
              Digital Inventory
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockLoyaltyPoints === 0 ? (
                <div className="text-center py-8">
                  <Gem className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No items yet. Open mystery boxes to build your inventory!</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gem className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Database integration coming soon!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Recent Orders
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockLoyaltyPoints === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No orders yet. Start your collection today!</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Database integration coming soon!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
