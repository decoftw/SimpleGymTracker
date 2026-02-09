'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <span>💪</span>
            <span>Gym Tracker</span>
          </Link>

          <div className="flex gap-6">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
