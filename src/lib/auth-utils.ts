// lib/auth-utils.ts
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserProfile } from '@/lib/firebase-user-utils';

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(result.user.uid, email, result.user.displayName);
  return result.user;
}
