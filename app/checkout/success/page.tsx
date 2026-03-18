'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Package, Crown, ArrowRight, Gift } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate processing time for the webhook to complete
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isProcessing) {
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
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">
              The Oracles are preparing your items...
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 text-gray-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Rolling the probability engine...</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Deducting inventory...</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Awarding Mana points...</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>Adding items to your inventory...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
            className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Unboxing Complete!
          </h2>
          
          <p className="text-gray-300 mb-8">
            Your mystery box items have been rolled and added to your digital inventory. Check your dashboard to see what legendary treasures you've discovered!
          </p>

          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">What You've Earned:</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Mystery Items</span>
                <span className="text-purple-400 font-bold">3 Items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Mana Points</span>
                <span className="text-purple-400 font-bold">+50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Guild Progress</span>
                <span className="text-purple-400 font-bold">+25 XP</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              View Your Loot
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/store"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
            >
              Browse More Boxes
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Session ID: {sessionId?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
