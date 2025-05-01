// components/auth/AuthGuard.tsx
'use client';

import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const { user, loading } = useFirebaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/signin');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return <>{children}</>;
}
