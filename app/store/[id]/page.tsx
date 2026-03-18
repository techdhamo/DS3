'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, Star, Shield, TrendingUp, Users, Zap, Gift, Crown, Gem } from 'lucide-react';
import { RazorpayCheckout } from '../../../src/components/razorpay/razorpay-checkout';

// Types
interface BoxItem {
  id: string;
  name: string;
  sku: string;
  rarityTier: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  dropChance: number;
  probability: number;
}

interface BoxTheme {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  isSoldOut: boolean;
  probabilityDistribution: {
    guaranteed: Array<{ item: BoxItem; count: number }>;
    random: BoxItem[];
    expectedRolls: number;
  };
}

// Rarity configuration
const rarityConfig = {
  COMMON: { color: 'text-gray-400', bgColor: 'bg-gray-900/50', borderColor: 'border-gray-600', icon: Gem },
  RARE: { color: 'text-blue-400', bgColor: 'bg-blue-900/50', borderColor: 'border-blue-600', icon: Sparkles },
  EPIC: { color: 'text-purple-400', bgColor: 'bg-purple-900/50', borderColor: 'border-purple-600', icon: Zap },
  LEGENDARY: { color: 'text-orange-400', bgColor: 'bg-orange-900/50', borderColor: 'border-orange-600', icon: Crown },
  MYTHIC: { color: 'text-pink-400', bgColor: 'bg-pink-900/50', borderColor: 'border-pink-600', icon: Star }
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const boxId = resolvedParams.id;
  const [box, setBox] = useState<BoxTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showUnboxing, setShowUnboxing] = useState(false);

  // Mock data for development
  const mockBox: BoxTheme = {
    id: boxId,
    name: "The Dark Wizard's Desk",
    description: "A mysterious collection of arcane artifacts and dark magical items gathered from a wizard's secret study. Each box contains 3-5 randomly selected items of varying rarity.",
    price: 49.99,
    imageUrl: 'https://picsum.photos/seed/dark-wizard-desk/800/600.jpg',
    isActive: true,
    isSoldOut: false,
    probabilityDistribution: {
      guaranteed: [],
      random: [
        { id: '1', name: 'Amethyst Crystal', sku: 'CRYSTAL-001', rarityTier: 'COMMON', dropChance: 25.0, probability: 38.76 },
        { id: '2', name: 'Mystical Rune Stone', sku: 'RUNE-001', rarityTier: 'COMMON', dropChance: 20.0, probability: 31.01 },
        { id: '3', name: 'Dragon Scale Fragment', sku: 'DRAGON-001', rarityTier: 'RARE', dropChance: 12.0, probability: 18.60 },
        { id: '4', name: 'Crystal Ball Orb', sku: 'ORB-001', rarityTier: 'EPIC', dropChance: 5.0, probability: 7.75 },
        { id: '5', name: 'Dragon Statue Miniature', sku: 'STATUE-001', rarityTier: 'LEGENDARY', dropChance: 2.0, probability: 3.10 },
        { id: '6', name: 'Ancient Spell Tome', sku: 'TOME-001', rarityTier: 'MYTHIC', dropChance: 0.5, probability: 0.78 }
      ],
      expectedRolls: 3
    }
  };

  useEffect(() => {
    // Simulate API call to fetch box details
    const fetchBox = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/store/boxes/${params.id}`);
        // const data = await response.json();
        
        // For now, use mock data
        setTimeout(() => {
          setBox(mockBox);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load box details');
        setLoading(false);
      }
    };

    fetchBox();
  }, [boxId]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAddingToCart(false);
      setShowUnboxing(true);
    }, 2000);
  };

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

  if (error || !box) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Box Not Found</h1>
          <p className="text-xl text-gray-300">This mystery box doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Unboxing Modal */}
      <AnimatePresence>
        {showUnboxing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowUnboxing(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-slate-900 p-8 rounded-2xl max-w-md w-full mx-4 border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center"
                >
                  <Gift className="w-16 h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Box Added to Cart!</h3>
                <p className="text-gray-300 mb-6">Your mystery box is ready for checkout</p>
                <button
                  onClick={() => setShowUnboxing(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30">
                {box.imageUrl ? (
                  <img
                    src={box.imageUrl}
                    alt={box.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-32 h-32 text-purple-400" />
                  </div>
                )}
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {box.isActive && (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    Available Now
                  </div>
                )}
                {box.isSoldOut && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    Sold Out
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {box.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold text-purple-400">
                  {formatPrice(box.price)}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-5 h-5" />
                  <span>2.3k sold</span>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                {box.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{box.probabilityDistribution.expectedRolls}</div>
                <div className="text-sm text-gray-300">Items per Box</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{box.probabilityDistribution.random.length}</div>
                <div className="text-sm text-gray-300">Possible Items</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">98%</div>
                <div className="text-sm text-gray-300">Satisfaction</div>
              </div>
            </div>

            {/* Drop Chances */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Drop Chances
              </h2>
              <div className="space-y-3">
                {box.probabilityDistribution.random.map((item) => {
                  const RarityIcon = rarityConfig[item.rarityTier].icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-lg border ${rarityConfig[item.rarityTier].bgColor} ${rarityConfig[item.rarityTier].borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <RarityIcon className={`w-5 h-5 ${rarityConfig[item.rarityTier].color}`} />
                          <div>
                            <div className={`font-semibold ${rarityConfig[item.rarityTier].color}`}>
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-400">{item.sku}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${rarityConfig[item.rarityTier].color}`}>
                            {item.probability.toFixed(2)}%
                          </div>
                          <div className="text-sm text-gray-400">chance</div>
                        </div>
                      </div>
                      
                      {/* Probability bar */}
                      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.probability}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full ${item.rarityTier === 'MYTHIC' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 
                                       item.rarityTier === 'LEGENDARY' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                       item.rarityTier === 'EPIC' ? 'bg-gradient-to-r from-purple-500 to-blue-500' :
                                       item.rarityTier === 'RARE' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                       'bg-gradient-to-r from-gray-500 to-gray-600'}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Purchase Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-purple-500/30 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-purple-400 hover:bg-purple-900/50 transition-colors rounded-l-lg"
                  >
                    -
                  </button>
                  <div className="px-6 py-3 text-white font-semibold min-w-[60px] text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="p-3 text-purple-400 hover:bg-purple-900/50 transition-colors rounded-r-lg"
                  >
                    +
                  </button>
                </div>
                <div className="text-xl font-bold text-white">
                  Total: {formatPrice(box.price * quantity)}
                </div>
              </div>

              <RazorpayCheckout
                items={[{
                  boxThemeId: box.id,
                  quantity: quantity,
                  boxThemeName: box.name,
                  price: box.price
                }]}
                onPaymentSuccess={() => {
                  console.log('Payment successful!');
                  // You can redirect to success page or show success message
                }}
                onPaymentError={(error) => {
                  console.error('Payment error:', error);
                  // Show error message to user
                }}
                className="w-full py-4"
              />

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Authentic Items</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Add ShoppingCart import
import { ShoppingCart } from 'lucide-react';
