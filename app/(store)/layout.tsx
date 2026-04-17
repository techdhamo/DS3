'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ShoppingCart, Heart, Menu, Search, Bell,
  ChevronLeft, User, MapPin, Phone, ArrowLeft, Globe
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/store' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, href: '/store/cart' },
    { id: 'favourite', label: 'Favourite', icon: Heart, href: '/store/wishlist' },
    { id: 'menu', label: 'Menu', icon: Menu, href: '#', onClick: () => setShowMenu(true) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Part of DS3 World */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 text-gray-600 hover:text-violet-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/store" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <div className="flex flex-col">
                <span className="text-violet-700 font-bold text-lg leading-tight">DS3 Store</span>
                <span className="text-gray-400 text-xs">Part of DS3 World</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full text-sm font-medium hover:bg-violet-100">
              <Globe className="w-4 h-4" />
              <span>World</span>
            </Link>
            <button className="p-2 text-gray-600 hover:text-violet-600">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-violet-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setActiveTab(item.id);
                }}
                className={`flex flex-col items-center gap-1 px-4 py-1 ${
                  isActive ? 'text-violet-600' : 'text-gray-500'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon className="w-6 h-6" />
                  {item.id === 'cart' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                      0
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Menu Sidebar */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-white z-50 overflow-y-auto"
            >
              {/* User Profile Section */}
              <div className="bg-violet-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Guest User</h3>
                    <p className="text-violet-200 text-sm">Sign in to continue</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <MenuItem icon={User} label="Profile" />
                  <MenuItem icon={MapPin} label="Track Order" />
                  <MenuItem icon={ShoppingCart} label="My Orders" />
                  <MenuItem icon={Phone} label="My Address" />
                </div>

                <h4 className="text-violet-600 font-semibold text-sm mb-3 px-2">Help & Support</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <MenuItem icon={Phone} label="Live Chat" />
                  <MenuItem icon={Phone} label="Help & Support" />
                  <MenuItem icon={User} label="About Us" />
                  <MenuItem icon={Phone} label="Terms & Conditions" />
                  <MenuItem icon={Phone} label="Privacy Policy" />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowMenu(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex items-center gap-3 w-full py-3 px-2 text-gray-700 hover:text-violet-600 transition-colors">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
