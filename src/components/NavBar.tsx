'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <span>💪</span>
            <span>Gym Tracker</span>
          </Link>

          <div className="flex gap-6 items-center">
            {user && (
              <>
                <Link
                  href="/"
                  className={`font-medium transition-colors ${
                    isActive('/') ? 'text-yellow-300' : 'hover:text-blue-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/templates"
                  className={`font-medium transition-colors ${
                    isActive('/templates') ? 'text-yellow-300' : 'hover:text-blue-100'
                  }`}
                >
                  Templates
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-blue-400">
                  <span className="text-sm">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            {!user && !isLoading && (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-yellow-400 text-blue-900 hover:bg-yellow-300 rounded-lg font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
