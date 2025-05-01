// hooks/useFirebaseUser.ts
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ensureUserProfile } from '@/lib/firebase-user-utils';

type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  familyId: string | null;
};

export function useFirebaseUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // ✅ Ensure user profile exists in Firestore
      await ensureUserProfile(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);

      // ✅ Now safe to fetch the user profile
      const profileRef = doc(db, 'users', firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);

      const familyId = profileSnap.exists() ? profileSnap.data().familyId || null : null;

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        familyId,
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
