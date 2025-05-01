// components/auth/RedirectIfAuthenticated.tsx
'use client';

import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RedirectIfAuthenticated() {
  const { user, loading } = useFirebaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  return null;
}
