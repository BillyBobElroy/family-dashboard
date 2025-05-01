'use client';

import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { WelcomeMessage } from '@/components/dashboard/WelcomeMessage';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { CreateFamilyForm } from '@/components/dashboard/CreateFamilyForm';

export default function DashboardHome() {
  const { user, loading } = useFirebaseUser();

  // Show loading spinner (optional)
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // If no familyId yet, show the Create Family flow
  if (!user?.familyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CreateFamilyForm />
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="space-y-6">
      <WelcomeMessage name={user.displayName || 'Friend'} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeatherWidget location="New York" />
        <UpcomingEvents />
      </div>
    </div>
  );
}
