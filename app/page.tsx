'use client';

import { motion } from 'framer-motion';
import { Sparkles, Package, Users, Sword } from 'lucide-react';
import { AuthNav } from '../src/components/navigation/auth-nav';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-midnight-900 overflow-hidden">
      {/* Background particle effect */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-neon-purple-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-neon-teal-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-gold-400 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-60 left-60 w-1 h-1 bg-neon-purple-300 rounded-full animate-float opacity-30" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-neon-teal-300 rounded-full animate-float opacity-40" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-32 right-60 w-1 h-1 bg-gold-300 rounded-full animate-float opacity-60" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-40 left-32 w-2 h-2 bg-neon-purple-500 rounded-full animate-float opacity-35" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-80 right-40 w-1 h-1 bg-neon-teal-500 rounded-full animate-float opacity-45" style={{ animationDelay: '0.8s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Sword className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-lg">DS3 World</span>
          </div>
          <AuthNav />
        </div>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6"
          >
            <Sparkles className="w-16 h-16 mx-auto text-neon-purple-400 animate-glow" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-heading text-6xl md:text-8xl font-bold mb-6 text-glow bg-gradient-to-r from-neon-purple-400 via-neon-teal-400 to-gold-400 bg-clip-text text-transparent"
          >
            DS3
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-midnight-300 mb-8 max-w-2xl mx-auto"
          >
            Enter a realm where mystery meets magic. Choose your path through two interconnected worlds.
          </motion.p>
        </motion.div>

        {/* DS3 Store Integration Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-8"
        >
          <Link href="/store">
            <div className="glass-dark rounded-xl px-6 py-3 border border-neon-purple-500/30 flex items-center gap-3 hover:border-neon-purple-400/50 transition-all cursor-pointer">
              <Package className="w-5 h-5 text-neon-purple-400" />
              <span className="text-midnight-200">Visit DS3 Store:</span>
              <span className="text-neon-purple-300 font-semibold">ds3.world/store</span>
              <span className="text-midnight-400 text-sm">(also accessible via ds3.store)</span>
            </div>
          </Link>
        </motion.div>

        {/* Dual CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-4xl"
        >
          {/* DS3 World Portal */}
          <motion.a
            href="/dashboard"
            className="group relative w-full md:w-1/2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="glass-dark rounded-2xl p-8 border border-neon-teal-500/30 portal-glow hover:border-neon-teal-400/50 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <Users className="w-12 h-12 text-neon-teal-400" />
                </motion.div>
                <h2 className="font-heading text-2xl font-bold mb-3 text-neon-teal-300 text-glow">
                  DS3 World
                </h2>
                <p className="text-midnight-300 mb-6">
                  Join the community, explore dungeons, trade items, and connect with fellow adventurers.
                </p>
                <div className="flex items-center gap-2 text-neon-teal-400 group-hover:text-neon-teal-300 transition-colors">
                  <span className="font-semibold">Enter World</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.a>

          {/* DS3 Store Portal */}
          <motion.a
            href="/store"
            className="group relative w-full md:w-1/2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="glass-dark rounded-2xl p-8 border border-violet-500/30 portal-glow hover:border-violet-400/50 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <Package className="w-12 h-12 text-violet-400" />
                </motion.div>
                <h2 className="font-heading text-2xl font-bold mb-3 text-violet-300 text-glow">
                  DS3 Store
                </h2>
                <p className="text-midnight-300 mb-6">
                  Shop mystery boxes, night lamps, self-care items & more. Available at ds3.world/store or ds3.store
                </p>
                <div className="flex items-center gap-2 text-violet-400 group-hover:text-violet-300 transition-colors">
                  <span className="font-semibold">Start Shopping</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.a>
        </motion.div>

        {/* Dungeon Raid CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="mt-8 flex justify-center"
        >
          <motion.a
            href="/dungeon-raid"
            className="group relative bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sword className="w-5 h-5" />
            Join Dungeon Raid
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              →
            </motion.div>
          </motion.a>
        </motion.div>

        {/* Subtle hint text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <p className="text-midnight-500 text-sm">
            Choose your destiny • Both worlds await
          </p>
        </motion.div>
      </div>
    </div>
  );
}
