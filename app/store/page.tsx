'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sword, Package, Star, Users, Filter, Sparkles, TrendingUp, Clock, Shield, CreditCard, TestTube } from 'lucide-react';
import Link from 'next/link';
import { RazorpayCheckout } from '../../src/components/razorpay/razorpay-checkout';

// Types
interface BoxTheme {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  isSoldOut: boolean;
  stats: {
    soldCount: number;
    satisfaction: number;
    itemsPerBox: number;
  };
}

// Mock data
const mockBoxes: BoxTheme[] = [
  {
    id: 'dark-wizard-desk',
    name: "The Dark Wizard's Desk",
    description: "Mysterious artifacts from a wizard's secret study",
    price: 49.99,
    imageUrl: 'https://picsum.photos/seed/dark-wizard-desk/400/300.jpg',
    isActive: true,
    isSoldOut: false,
    stats: {
      soldCount: 2347,
      satisfaction: 98,
      itemsPerBox: 3
    }
  },
  {
    id: 'dragon-lair-hoard',
    name: "Dragon Lair Hoard",
    description: "Treasures collected from ancient dragon nests",
    price: 79.99,
    imageUrl: 'https://picsum.photos/seed/dragon-lair-hoard/400/300.jpg',
    isActive: true,
    isSoldOut: false,
    stats: {
      soldCount: 1823,
      satisfaction: 96,
      itemsPerBox: 4
    }
  },
  {
    id: 'enchanted-forest',
    name: "Enchanted Forest Collection",
    description: "Magical items from mystical woodland realms",
    price: 34.99,
    imageUrl: 'https://picsum.photos/seed/enchanted-forest/400/300.jpg',
    isActive: true,
    isSoldOut: false,
    stats: {
      soldCount: 3456,
      satisfaction: 94,
      itemsPerBox: 2
    }
  },
  {
    id: 'celestial-vault',
    name: "Celestial Vault",
    description: "Rare artifacts from beyond the stars",
    price: 129.99,
    imageUrl: 'https://picsum.photos/seed/celestial-vault/400/300.jpg',
    isActive: false,
    isSoldOut: false,
    stats: {
      soldCount: 567,
      satisfaction: 99,
      itemsPerBox: 5
    }
  }
];

export default function StorePage() {
  const [boxes, setBoxes] = useState<BoxTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'coming-soon'>('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBoxes(mockBoxes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBoxes = boxes.filter(box => {
    if (filter === 'available') return box.isActive && !box.isSoldOut;
    if (filter === 'coming-soon') return !box.isActive;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-slate-900/50" />
        <div className="container mx-auto px-4 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Mystery Box
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {' '}Store
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Discover rare and magical items in our exclusive mystery boxes. 
              Each box contains carefully curated artifacts with guaranteed value and the chance to obtain legendary treasures.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">10k+</div>
                <div className="text-sm text-gray-300">Happy Customers</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">97%</div>
                <div className="text-sm text-gray-300">Satisfaction Rate</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-300">Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-1 flex">
            {(['all', 'available', 'coming-soon'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  filter === tab
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab === 'all' && 'All Boxes'}
                {tab === 'available' && 'Available Now'}
                {tab === 'coming-soon' && 'Coming Soon'}
              </button>
            ))}
          </div>
        </div>

        {/* Boxes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoxes.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/store/${box.id}`}>
                <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    {box.imageUrl ? (
                      <img
                        src={box.imageUrl}
                        alt={box.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-slate-900">
                        <Package className="w-24 h-24 text-purple-400" />
                      </div>
                    )}
                    
                    {/* Overlay badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {box.isActive && !box.isSoldOut && (
                        <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/50 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                          Available
                        </div>
                      )}
                      {box.isSoldOut && (
                        <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                          Sold Out
                        </div>
                      )}
                      {!box.isActive && (
                        <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
                          Coming Soon
                        </div>
                      )}
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-bold">
                      {formatPrice(box.price)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {box.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {box.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <div className="text-purple-400 font-bold">{box.stats.itemsPerBox}</div>
                        <div className="text-xs text-gray-400">Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-bold">{box.stats.soldCount}</div>
                        <div className="text-xs text-gray-400">Sold</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-bold">{box.stats.satisfaction}%</div>
                        <div className="text-xs text-gray-400">Happy</div>
                      </div>
                    </div>

                    {/* View Button */}
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBoxes.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-purple-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No Boxes Found</h3>
            <p className="text-gray-300">Check back soon for new mystery boxes!</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose DS3 Mystery Boxes?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Every box is carefully curated to provide maximum value and excitement
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'Guaranteed Value',
              description: 'Every box contains items worth more than the purchase price'
            },
            {
              icon: TrendingUp,
              title: 'Fair Drop Rates',
              description: 'Transparent probability system with published drop chances'
            },
            {
              icon: Clock,
              title: 'Fast Delivery',
              description: 'Quick processing and secure shipping worldwide'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-8 text-center"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Test Card Information Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-br from-green-900/20 to-slate-900/50 border border-green-500/30 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TestTube className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Test Mode - Payment Testing</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Valid Test Cards
              </h3>
              <div className="space-y-3">
                <div className="bg-black/50 p-4 rounded-lg border border-green-500/30">
                  <div className="font-mono text-green-300 mb-1">Card Number: 4111 1111 1111 1111</div>
                  <div className="text-sm text-gray-400">✅ This card should work for international testing</div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-blue-500/30">
                  <div className="font-mono text-blue-300 mb-1">Card Number: 4000 0000 0000 0002</div>
                  <div className="text-sm text-gray-400">✅ Alternative test card</div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-purple-500/30">
                  <div className="font-mono text-purple-300 mb-1">Card Number: 5200 0000 0000 0007</div>
                  <div className="text-sm text-gray-400">✅ Mastercard test card</div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-orange-500/30">
                  <div className="font-mono text-orange-300 mb-1">Card Number: 4851 1111 1111 1114</div>
                  <div className="text-sm text-gray-400">🇮🇳 Domestic Visa - Best for Indian testing</div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-yellow-500/30">
                  <div className="font-mono text-yellow-300 mb-1">Card Number: 5176 5236 5462 4604</div>
                  <div className="text-sm text-gray-400">🇮🇳 Domestic Mastercard - Indian testing</div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-red-500/30">
                  <div className="font-mono text-red-300 mb-1">Card Number: 6011 1111 1111 1117</div>
                  <div className="text-sm text-gray-400">🇮🇳 Domestic Maestro - Indian debit card</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">Test Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="text-green-400">Expiry:</span> Any future date (e.g., 12/25)</p>
                <p><span className="text-green-400">CVV:</span> Any 3 digits (e.g., 123)</p>
                <p><span className="text-green-400">OTP:</span> 123456 (when prompted)</p>
                <p><span className="text-orange-400">🇮🇳 Recommended:</span> Use domestic cards (4851, 5176, 6011) for Indian transactions</p>
                <p className="text-sm text-gray-400 mt-4">
                  Domestic Indian cards (🇮🇳) work best for Razorpay India testing. 
                  If international cards fail, try the domestic Visa card starting with 4851.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
