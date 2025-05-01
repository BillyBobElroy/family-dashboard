// lib/invite-utils.ts
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { nanoid } from 'nanoid';

export async function sendFamilyInvite(email: string, familyId: string, invitedBy: string) {
  const inviteId = nanoid(12);
  const inviteRef = doc(db, 'invites', inviteId);

  await setDoc(inviteRef, {
    email,
    familyId,
    invitedBy,
    status: 'pending',
    createdAt: Date.now(),
  });

  return inviteId;
}
