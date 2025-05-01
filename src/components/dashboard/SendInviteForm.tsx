'use client';

import { useState } from 'react';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { sendFamilyInvite } from '@/lib/invite-utils';

export function SendInviteForm() {
  const { user } = useFirebaseUser();
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLink('');

    try {
      if (!user?.familyId) {
        setError('You must be part of a family to invite others.');
        return;
      }

      const inviteId = await sendFamilyInvite(email.trim(), user.familyId, user.uid);
      const inviteUrl = `${window.location.origin}/invite/${inviteId}`;
      setLink(inviteUrl);
      setEmail('');
    } catch (err) {
      console.error(err);
      setError('Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4 max-w-md">
      <h2 className="text-lg font-bold">Invite Someone to Your Family</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        className="w-full border border-gray-300 rounded px-3 py-2"
        required
        disabled={loading}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {link && (
        <p className="text-sm text-green-600 break-all">
          Invite link: <a href={link} className="underline">{link}</a>
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Invite'}
      </button>
    </form>
  );
}
