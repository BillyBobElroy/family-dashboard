// lib/hooks/useFamilyName.ts
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // your Firebase init file
import { useFirebaseUser } from '@/hook/useFirebaseUser'; // assumes you have auth logic

export function useFamilyName() {
  const [familyName, setFamilyName] = useState('');
  const { user } = useFirebaseUser(); // must contain familyId in user record

  useEffect(() => {
    async function fetchFamilyName() {
      if (!user?.familyId) return;

      const familyRef = doc(db, 'families', user.familyId);
      const familySnap = await getDoc(familyRef);
      if (familySnap.exists()) {
        const data = familySnap.data();
        setFamilyName(data.name || '');
      }
    }

    fetchFamilyName();
  }, [user]);

  return familyName;
}
