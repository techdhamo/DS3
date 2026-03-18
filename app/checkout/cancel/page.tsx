'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingCart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Payment Cancelled
          </h2>
          
          <p className="text-gray-300 mb-8">
            No worries! Your payment was cancelled and no charges were made. Your mystery box treasures are still waiting for you when you're ready.
          </p>

          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Did you know?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-gray-300">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm">Every purchase earns Mana points for dungeon raids</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm">Mythic items have less than 1% drop chance</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm">Join 10-player raids for bonus loot</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/store"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Back to Store
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <Link
              href="/"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
            >
              Return Home
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
