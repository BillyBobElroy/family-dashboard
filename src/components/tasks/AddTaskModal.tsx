'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { nanoid } from 'nanoid';

type Props = {
  onClose: () => void;
  onTaskAdded: () => void;
};

type Member = {
  id: string;
  displayName: string;
  color?: string;
};

export function AddTaskModal({ onClose, onTaskAdded }: Props) {
  const { user } = useFirebaseUser();

  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [time, setTime] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly'>('none');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<{ id: string; text: string; checked: boolean }[]>([]);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.familyId) return;
    const loadMembers = async () => {
      const snap = await getDocs(collection(db, `families/${user.familyId}/members`));
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, 'id'>),
      }));
      setMembers(list);
    };
    loadMembers();
  }, [user]);

  const handleAddChecklistItem = () => {
    setChecklist(prev => [...prev, { id: nanoid(), text: '', checked: false }]);
  };

  const handleChecklistChange = (id: string, value: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, text: value } : item));
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleAdd = async () => {
    if (!user?.familyId || !title || !assignedTo || !dueDate) return;
    setLoading(true);

    try {
      await addDoc(collection(db, `families/${user.familyId}/tasks`), {
        title,
        assignedTo,
        createdBy: user.uid,
        time: time || null,
        dueDate,
        repeat: repeat === 'none' ? null : repeat,
        category: category || null,
        priority,
        notes,
        checklist,
        completed: false,
        createdAt: Date.now(),
      });

      onTaskAdded();
      onClose();
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md space-y-4 relative overflow-y-auto max-h-screen">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 text-xl hover:text-black">
          &times;
        </button>
        <h2 className="text-xl font-bold">Add Task</h2>

        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Assign to...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-1/2 border rounded px-3 py-2"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-1/2 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Repeat</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as 'none' | 'daily' | 'weekly')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="none">No Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">No Category</option>
            <option value="morning">🌅 Morning</option>
            <option value="evening">🌙 Evening</option>
            <option value="chores">🧹 Chores</option>
            <option value="school">🎒 School</option>
            <option value="other">📦 Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes here..."
            className="w-full border rounded px-3 py-2 min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Checklist</label>
          {checklist.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleChecklistChange(item.id, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-grow border px-2 py-1 rounded"
              />
              <button
                onClick={() => handleRemoveChecklistItem(item.id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove checklist item"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddChecklistItem}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add checklist item
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Add Task'}
        </button>
      </div>
    </div>
  );
}