'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { collection, addDoc, getDocs } from 'firebase/firestore';

type Props = {
  onClose: () => void;
  onListCreated: () => void;
};

export function CreateListModal({ onClose, onListCreated }: Props) {
  const { user } = useFirebaseUser();
  const [title, setTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user?.familyId || !title.trim()) return;
    setLoading(true);

    try {
      await addDoc(collection(db, `families/${user.familyId}/lists`), {
        title: title.trim(),
        isPrivate,
        createdBy: user.uid,
        createdAt: Date.now(),
        items: [],
      });

      onListCreated();
      onClose();
      setTitle('');
      setIsPrivate(false);
    } catch (err) {
      console.error('Failed to create list:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold">Create New List</h2>

        <input
          type="text"
          placeholder="List title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Make this list private
        </label>

        <button
          onClick={handleCreate}
          disabled={!title || loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create List'}
        </button>
      </div>
    </div>
  );
}
