'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { nanoid } from 'nanoid';

type ListItem = {
  id: string;
  text: string;
  checked: boolean;
};

export default function ListDetailPage() {
  const { user } = useFirebaseUser();
  const { listId } = useParams();
  const [items, setItems] = useState<ListItem[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    if (!user?.familyId || !listId) return;

    const loadList = async () => {
      const ref = doc(db, `families/${user.familyId}/lists/${listId}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        setItems(data.items || []);
      }
      setLoading(false);
    };

    loadList();
  }, [user, listId]);

  const saveList = async (updatedItems: ListItem[]) => {
    if (!user?.familyId || !listId) return;
    setItems(updatedItems);

    await updateDoc(doc(db, `families/${user.familyId}/lists/${listId}`), {
      items: updatedItems,
    });
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ListItem = {
      id: nanoid(),
      text: newItemText.trim(),
      checked: false,
    };
    const updated = [...items, newItem];
    saveList(updated);
    setNewItemText('');
  };

  const handleTextChange = (id: string, text: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  const handleToggleChecked = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveList(updated);
  };

  const handleBlur = () => saveList(items);

  const handleDelete = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveList(updated);
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-white px-4 py-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      <ul className="space-y-3 mb-8">
        {items.map(item => (
          <li
            key={item.id}
            className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 shadow-sm hover:shadow transition"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleToggleChecked(item.id)}
              className="w-5 h-5 accent-blue-600 rounded-md"
            />
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleTextChange(item.id, e.target.value)}
              onBlur={handleBlur}
              placeholder="List item"
              className="flex-grow border-none focus:ring-0 bg-transparent text-sm"
            />
            <button
              onClick={() => handleDelete(item.id)}
              className="text-gray-400 hover:text-red-500 text-xl font-semibold"
              aria-label="Delete item"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add new item..."
          className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleAddItem}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>
    </div>
  );
}