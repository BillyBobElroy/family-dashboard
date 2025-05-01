'use client';

import { useState } from 'react';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { createFamily } from '@/lib/family-utils';
import { useRouter } from 'next/navigation';

export function CreateFamilyForm() {
  const { user, loading } = useFirebaseUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError('You must be signed in to create a family.');
      return;
    }

    if (!name.trim()) {
      setError('Family name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const familyId = await createFamily(name.trim(), user.uid, user.displayName);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong while creating your family.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while auth is being checked
  if (loading) {
    return <p className="text-center">Checking user status…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold">Create Your Family</h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Smith"
        className="w-full border border-gray-300 rounded px-3 py-2"
        disabled={submitting}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Creating…' : 'Create Family'}
      </button>
    </form>
  );
}
