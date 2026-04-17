'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Heart, ShoppingCart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Categories matching the images
const categories = [
  { id: 'water-bottle', name: 'Water Bottle', image: 'https://picsum.photos/seed/water/100/100', count: 32 },
  { id: 'night-lamp', name: 'Night Lamp', image: 'https://picsum.photos/seed/lamp/100/100', count: 24 },
  { id: 'self-care', name: 'Self Care', image: 'https://picsum.photos/seed/care/100/100', count: 18 },
  { id: 'home-living', name: 'Home & Living', image: 'https://picsum.photos/seed/home/100/100', count: 45 },
  { id: 'kitchen', name: 'Kitchen', image: 'https://picsum.photos/seed/kitchen/100/100', count: 28 },
  { id: 'mobile-acc', name: 'Mobile Acc', image: 'https://picsum.photos/seed/mobile/100/100', count: 56 },
];

// Products data with dropshipping integration
const products = {
  'night-lamp': [
    {
      id: 'lamp-1',
      code: 'LI-001',
      name: 'Star Master Style Starry Sky Projector Lamp',
      price: 180,
      originalPrice: 250,
      image: 'https://picsum.photos/seed/starlamp/200/200',
      rating: 4.5,
      reviews: 234,
      isDropship: true,
      supplier: 'DeoDap',
    },
    {
      id: 'lamp-2',
      code: 'LI-002',
      name: 'Breathing Tech Light Soft Silicone LED',
      price: 290,
      image: 'https://picsum.photos/seed/breathing/200/200',
      rating: 4.8,
      reviews: 189,
      isDropship: true,
      supplier: 'IndiaMart',
    },
  ],
  'self-care': [
    {
      id: 'care-1',
      name: 'Electric Scalp Massager',
      price: 499,
      originalPrice: 699,
      image: 'https://picsum.photos/seed/massager/200/200',
      rating: 4.6,
      reviews: 156,
      isDropship: true,
      supplier: 'DeoDap',
    },
    {
      id: 'care-2',
      name: 'Manicure Pedicure Set',
      price: 299,
      image: 'https://picsum.photos/seed/manicure/200/200',
      rating: 4.4,
      reviews: 89,
      isDropship: true,
      supplier: 'TradeIndia',
    },
  ],
};

// Banner data
const banners = [
  {
    id: 1,
    title: 'Chic Accessories',
    subtitle: 'Shop Now, Elevate Your Style',
    image: 'https://picsum.photos/seed/chic/400/200',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 2,
    title: 'MINI JOY DECOR',
    subtitle: 'Designed to delight',
    cta: 'PRODUCTS START AT ₹49/-',
    image: 'https://picsum.photos/seed/decor/400/200',
    gradient: 'from-pink-500 to-rose-500',
  },
];

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="pb-4">
      {/* DS3 World Integration Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm">Part of</span>
            <Link href="/" className="text-white font-semibold hover:underline">DS3 World</Link>
          </div>
          <span className="text-white/60 text-xs">ds3.world/store</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-700"
          />
        </div>
      </div>

      {/* Categories Section */}
      <section className="px-4 py-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">All Categories</h2>
          <Link href="/store/categories" className="text-violet-600 text-sm font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 ${
                activeCategory === category.id ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                activeCategory === category.id ? 'border-violet-500' : 'border-gray-200'
              }`}>
                <Image
                  src={category.image}
                  alt={category.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center w-16 truncate">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Banners */}
      <section className="px-4 py-4">
        <div className="space-y-4">
          {banners.map((banner) => (
            <motion.div
              key={banner.id}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${banner.gradient} p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                  <p className="text-white/80 text-sm">{banner.subtitle}</p>
                  {banner.cta && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                      {banner.cta}
                    </span>
                  )}
                </div>
                <div className="w-24 h-24 rounded-xl overflow-hidden">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Night Lamp</h2>
          <Link href="/store/category/night-lamp" className="text-violet-600 text-sm font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {products['night-lamp']?.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={() => toggleWishlist(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Self Care Section */}
      <section className="px-4 py-4 bg-white mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Self Care</h2>
          <Link href="/store/category/self-care" className="text-violet-600 text-sm font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {products['self-care']?.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={() => toggleWishlist(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Dropshipping Badge */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Premium Dropshipping</h3>
            <p className="text-violet-200 text-sm">Direct from suppliers to your door</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Product {
  id: string;
  code?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isDropship: boolean;
  supplier?: string;
}

function ProductCard({ 
  product, 
  isWishlisted, 
  onToggleWishlist 
}: { 
  product: Product; 
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
    >
      {/* Product Image */}
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            onClick={onToggleWishlist}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
          >
            <Heart 
              className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
          <button className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-md">
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
        {product.code && (
          <span className="text-violet-600 text-xs font-medium">({product.code})</span>
        )}
        <h3 className="text-gray-800 text-sm font-medium line-clamp-2 mt-1">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-violet-700 font-bold">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-gray-600 text-xs">{product.rating}</span>
          <span className="text-gray-400 text-xs">({product.reviews})</span>
        </div>
      </div>
    </motion.div>
  );
}
