// app/dashboard/layout.tsx
import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
    </AuthGuard>
  );
}
