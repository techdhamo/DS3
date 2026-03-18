'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Sword, User, LogOut, Shield } from 'lucide-react';

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-white text-sm">{session.user?.name || 'Player'}</div>
            <div className="text-xs text-gray-400">Level 5</div>
          </div>
          
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          
          <button
            onClick={() => signOut()}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link 
      href="/auth/signin"
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-[1.02] flex items-center gap-2"
    >
      <Sword className="w-4 h-4" />
      <span className="hidden sm:inline">Sign In</span>
    </Link>
  );
}
