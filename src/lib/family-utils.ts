// lib/family-utils.ts
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db } from '@/lib/firebase';

export async function createFamily(familyName: string, uid: string, displayName: string | null) {
  const familyId = nanoid(8);

  await setDoc(doc(db, 'families', familyId), {
    name: familyName,
    createdAt: Date.now(),
  });

  await setDoc(doc(db, `families/${familyId}/members/${uid}`), {
    role: 'admin',
    displayName: displayName || 'Unnamed',
  });

  await updateDoc(doc(db, 'users', uid), {
    familyId,
  });

  return familyId;
}
