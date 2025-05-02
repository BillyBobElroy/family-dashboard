'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

type Member = {
  id: string;
  displayName: string;
  color?: string;
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = useFirebaseUser();
  const [hideCompleted, setHideCompleted] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);

  const isLoggedIn = !!user;
  const isDashboard = pathname.startsWith('/dashboard');
  const isAuth = pathname.startsWith('/auth');
  const isLanding = pathname === '/';
  const isCalendar = pathname.includes('/calendar');
  const isTasks = pathname.includes('/tasks');

  const familyName = user?.familyName || 'Your';

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.familyId) return;
      const snap = await getDocs(collection(db, `families/${user.familyId}/members`));
      const members: Member[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, 'id'>),
      }));
      setFamilyMembers(members);
    };
    fetchMembers();
  }, [user?.familyId]);

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {!isLoggedIn && (
          <Link href="/" className="text-xl font-bold text-blue-600">
            FamilyDash
          </Link>
        )}

        {isLoggedIn && isDashboard && (
          <>
            <div className="text-xl font-bold text-blue-800">
              {familyName} Family
            </div>
            <div className="text-xs text-gray-500">72°F & Sunny</div>
          </>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {isLanding && !isLoggedIn && (
          <>
            <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
              Get Started
            </Link>
          </>
        )}

        {isAuth && (
          <p className="text-sm text-gray-500">Welcome to FamilyDash</p>
        )}

        {isDashboard && isLoggedIn && (
          <>
            <div className="flex gap-1">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center"
                  style={{ backgroundColor: member.color || '#3B82F6' }}
                >
                  {member.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
              ))}
            </div>

            {isCalendar && (
              <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                Schedule ▼
              </button>
            )}

            {isTasks && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHideCompleted(prev => !prev)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {hideCompleted ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Show Completed
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Hide Completed
                    </>
                  )}
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
          </>
        )}
      </div>
    </nav>
  );
}
