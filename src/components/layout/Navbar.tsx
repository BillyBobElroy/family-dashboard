'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useFirebaseUser();

  const isLoggedIn = !!user;
  const isDashboard = pathname.startsWith('/dashboard');
  const isAuth = pathname.startsWith('/auth');
  const isLanding = pathname === '/';
  const isCalendar = pathname.includes('/calendar');
  const isTasks = pathname.includes('/tasks');

  const familyName = user?.familyName || 'Your';

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        FamilyDash
      </Link>

      {isLanding && !isLoggedIn && (
        <div className="flex gap-4">
          <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline">
            Sign In
          </Link>
          <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      )}

      {isAuth && (
        <p className="text-sm text-gray-500">Welcome to FamilyDash</p>
      )}

      {isDashboard && isLoggedIn && (
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-gray-700">
            {familyName} Family
          </div>

          {/* Weather placeholder */}
          <div className="text-xs text-gray-500">72°F & Sunny</div>

          {/* Family avatars */}
          <div className="flex gap-1">
            {/* Replace these with actual avatars */}
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center"
              >
                {id}
              </div>
            ))}
          </div>

          {isCalendar && (
            <div>
              <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                Schedule ▼
              </button>
            </div>
          )}

          {isTasks && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-sm text-gray-700 hover:underline">
                <Eye className="w-4 h-4" /> Hide Completed
              </button>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-200 rounded">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">Today</span>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Dashboard
          </Link>
          <Link href="/account" className="text-sm text-blue-600 hover:underline">
            Account
          </Link>
        </div>
      )}
    </nav>
  );
}
