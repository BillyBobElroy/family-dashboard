'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const presetColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#0EA5E9', '#F97316'
];

function getRandomColor() {
  return presetColors[Math.floor(Math.random() * presetColors.length)];
}

export default function JoinFamilyPage() {
  const { inviteId } = useParams() as { inviteId: string };
  const router = useRouter();
  const { user, loading } = useFirebaseUser();

  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!inviteId) return;
    const fetchInvite = async () => {
      try {
        const inviteRef = doc(db, 'invites', inviteId);
        const inviteSnap = await getDoc(inviteRef);
        if (inviteSnap.exists()) {
          setInvite({ id: inviteSnap.id, ...inviteSnap.data() });
        } else {
          setError('Invite not found or already used.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load invite.');
      }
    };

    fetchInvite();
  }, [inviteId]);

  const handleJoin = async () => {
    if (!user || !invite) return;

    if (user.email !== invite.email) {
      setError('This invite was not sent to your email.');
      return;
    }

    setJoining(true);
    try {
      const { familyId } = invite;

      // 1. Add user to the family members collection
      await setDoc(doc(db, `families/${familyId}/members/${user.uid}`), {
        role: 'member',
        displayName: user.displayName || 'Unnamed',
        color: getRandomColor(),
      });

      // 2. Update user profile with familyId
      await updateDoc(doc(db, `users/${user.uid}`), {
        familyId,
      });

      // 3. Mark invite as accepted or delete it
      await deleteDoc(doc(db, 'invites', inviteId));

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to join family.');
    } finally {
      setJoining(false);
    }
  };

  if (loading || (!invite && !error)) {
    return <p className="text-center p-4">Loading invite...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa] px-4">
      <div className="bg-white p-6 rounded-xl shadow max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold text-center">Join Family</h2>
        {invite ? (
          <>
            <p className="text-center">
              You’ve been invited to join the <strong>{invite.familyName || invite.familyId}</strong> family.
            </p>
            <button
              onClick={handleJoin}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={joining}
            >
              {joining ? 'Joining...' : 'Accept Invite'}
            </button>
          </>
        ) : (
          <p className="text-center text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
