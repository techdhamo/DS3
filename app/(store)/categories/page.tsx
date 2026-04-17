'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, ChevronLeft, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Extended categories
const allCategories = [
  { id: 'water-bottle', name: 'Water Bottle', image: 'https://picsum.photos/seed/water/80/80', count: 32 },
  { id: 'night-lamp', name: 'Night Lamp', image: 'https://picsum.photos/seed/lamp/80/80', count: 24 },
  { id: 'self-care', name: 'Self Care', image: 'https://picsum.photos/seed/care/80/80', count: 18 },
  { id: 'home-living', name: 'Home and Living', image: 'https://picsum.photos/seed/home/80/80', count: 45 },
  { id: 'kitchen', name: 'Kitchen Accessories', image: 'https://picsum.photos/seed/kitchen/80/80', count: 28 },
  { id: 'mobile-acc', name: 'Mobile Accessories', image: 'https://picsum.photos/seed/mobile/80/80', count: 56 },
  { id: 'beauty', name: 'Beauty & Personal', image: 'https://picsum.photos/seed/beauty/80/80', count: 67 },
  { id: 'toys', name: 'Toys & Games', image: 'https://picsum.photos/seed/toys/80/80', count: 43 },
  { id: 'stationery', name: 'Stationery', image: 'https://picsum.photos/seed/stationery/80/80', count: 89 },
  { id: 'electronics', name: 'Electronics', image: 'https://picsum.photos/seed/electronics/80/80', count: 34 },
  { id: 'fashion', name: 'Fashion', image: 'https://picsum.photos/seed/fashion/80/80', count: 123 },
  { id: 'sports', name: 'Sports & Fitness', image: 'https://picsum.photos/seed/sports/80/80', count: 28 },
];

// Mock products for category
const categoryProducts = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i}`,
  name: `Premium Product ${i + 1}`,
  price: Math.floor(Math.random() * 500) + 99,
  originalPrice: Math.floor(Math.random() * 800) + 199,
  image: `https://picsum.photos/seed/product${i}/150/150`,
  rating: (Math.random() * 2 + 3).toFixed(1),
  reviews: Math.floor(Math.random() * 500) + 50,
  isDropship: Math.random() > 0.5,
  supplier: ['DeoDap', 'IndiaMart', 'TradeIndia'][Math.floor(Math.random() * 3)],
}));

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/store" className="p-2 -ml-2 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-gray-800">Category</h1>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop & Mobile */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300
          ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 space-y-2 h-full overflow-y-auto">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowMobileSidebar(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-violet-100 border-2 border-violet-500' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 text-left">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Category Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedCategory 
                  ? allCategories.find(c => c.id === selectedCategory)?.name 
                  : 'All Products'
                }
              </h2>
              <p className="text-gray-500 text-sm">
                {selectedCategory 
                  ? `${allCategories.find(c => c.id === selectedCategory)?.count} Products`
                  : `${categoryProducts.length} Products`
                }
              </p>
            </div>
            
            {/* Mobile category toggle */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 bg-violet-100 rounded-lg text-violet-600"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryProducts.map((product) => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <Heart 
                        className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                      />
                    </button>
                    <button className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-sm">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Dropshipping Badge */}
                  {product.isDropship && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-violet-600/90 rounded-full">
                      <span className="text-white text-xs font-medium">{product.supplier}</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-gray-800 text-sm font-medium line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-violet-700 font-bold">₹{product.price}</span>
                    <span className="text-gray-400 text-sm line-through">₹{product.originalPrice}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-gray-600 text-xs">{product.rating}</span>
                    <span className="text-gray-400 text-xs">({product.reviews})</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
