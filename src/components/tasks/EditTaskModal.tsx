'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import type { Task, ChecklistItem } from '@/types/task';

type Member = {
  id: string;
  displayName: string;
};

type Props = {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
};

export function EditTaskModal({ task, onClose, onTaskUpdated }: Props) {
  const { user } = useFirebaseUser();

  const [title, setTitle] = useState(task.title);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [time, setTime] = useState(task.time || '');
  const [repeat, setRepeat] = useState<Task['repeat']>(task.repeat || 'none');
  const [priority, setPriority] = useState<Task['priority']>(task.priority || 'medium');
  const [category, setCategory] = useState(task.category || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    (task.checklist || []).map(item => ({
      id: item.id,
      text: item.text,
      checked: (item as any).checked ?? (item as any).done ?? false,
    }))
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.familyId) return;
      const snap = await getDocs(collection(db, `families/${user.familyId}/members`));
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, 'id'>),
      }));
      setMembers(list);
    };
    fetchMembers();
  }, [user]);

  const handleChecklistChange = (id: string, value: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, text: value } : item));
  };

  const handleAddChecklistItem = () => {
    setChecklist(prev => [...prev, { id: nanoid(), text: '', checked: false }]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!user?.familyId || !title || !assignedTo || !dueDate) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, `families/${user.familyId}/tasks/${task.id}`), {
        title,
        assignedTo,
        dueDate,
        time,
        repeat: repeat === 'none' ? null : repeat,
        priority,
        category,
        notes,
        checklist,
      });
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.familyId) return;
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, `families/${user.familyId}/tasks/${task.id}`));
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md space-y-4 relative overflow-y-auto max-h-screen">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 text-xl hover:text-black">
          &times;
        </button>
        <h2 className="text-xl font-bold">Edit Task</h2>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <select
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Assign to...</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-1/2 border rounded px-3 py-2"
          />
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-1/2 border rounded px-3 py-2"
          />
        </div>

        <select
          value={repeat || 'none'}
          onChange={e => setRepeat(e.target.value as Task['repeat'])}
          className="w-full border rounded px-3 py-2"
        >
          <option value="none">No Repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Task['priority'])}
          className="w-full border rounded px-3 py-2"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">No Category</option>
          <option value="morning">🌅 Morning</option>
          <option value="evening">🌙 Evening</option>
          <option value="chores">🧹 Chores</option>
          <option value="school">🎒 School</option>
          <option value="other">📦 Other</option>
        </select>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2"
          placeholder="Optional notes..."
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium">Checklist</label>
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="text"
                value={item.text}
                onChange={e => handleChecklistChange(item.id, e.target.value)}
                className="flex-grow border px-2 py-1 rounded"
              />
              <button
                type="button"
                onClick={() => handleRemoveChecklistItem(item.id)}
                className="text-red-500 hover:text-red-700"
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

        <div className="flex justify-between pt-4">
          <button
            onClick={handleDelete}
            className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50"
          >
            Delete
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}