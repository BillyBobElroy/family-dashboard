// lib/firebase-user-utils.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function ensureUserProfile(uid: string, email: string | null, displayName: string | null) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email,
      displayName,
      familyId: null,
      createdAt: Date.now(),
    });
  }
}
