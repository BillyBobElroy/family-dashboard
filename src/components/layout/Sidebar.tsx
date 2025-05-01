'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useFamilyName } from '@/hook/useFamilyName';
import { FamilySettingsModal } from '@/components/dashboard/FamilySettingsModal';
import {
  CalendarDays, CheckCircle, Star, Utensils, Image as ImageIcon,
  ListTodo, Moon, Settings
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckCircle },
  //{ href: '/dashboard/rewards', label: 'Rewards', icon: Star },
  { href: '/dashboard/meals', label: 'Meals', icon: Utensils },
  { href: '/dashboard/photos', label: 'Photos', icon: ImageIcon },
  { href: '/dashboard/lists', label: 'Lists', icon: ListTodo },
  { href: '/dashboard/sleep', label: 'Sleep', icon: Moon },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const familyName = useFamilyName();
  const initial = familyName?.charAt(0)?.toUpperCase() || 'F';

  const [showModal, setShowModal] = useState(false);

  return (
    <aside className="w-20 bg-[#eaf0f5] flex flex-col items-center py-4 space-y-6 border-r relative">
      {/* Clickable Initial */}
      <button
        onClick={() => setShowModal(true)}
        className="w-10 h-10 bg-white text-gray-600 rounded-full flex items-center justify-center font-bold text-xl hover:ring-2 ring-blue-400 transition"
        title="Manage Family"
      >
        {initial}
      </button>

      {/* Modal */}
      {showModal && <FamilySettingsModal onClose={() => setShowModal(false)} />}

      {/* Navigation Items */}
      <nav className="flex flex-col items-center space-y-4 w-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center w-full py-2 transition ${
                isActive ? 'bg-white text-black font-semibold' : 'text-gray-500 hover:text-black'
              }`}
            >
              <Icon size={22} className="mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}