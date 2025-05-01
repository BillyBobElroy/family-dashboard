'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirebaseUser } from '@/hook/useFirebaseUser';

type Props = {
  event: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    location?: string;
    notes?: string;
  };
  onClose: () => void;
  onEventUpdated: () => void;
};

export function EditEventModal({ event, onClose, onEventUpdated }: Props) {
  const { user } = useFirebaseUser();

  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.start.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(event.start.toTimeString().slice(0, 5));
  const [endTime, setEndTime] = useState(event.end.toTimeString().slice(0, 5));
  const [location, setLocation] = useState(event.location || '');
  const [notes, setNotes] = useState(event.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!user?.familyId || !title || !date || !startTime || !endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateDoc(doc(db, `families/${user.familyId}/events/${event.id}`), {
        title,
        date,
        startTime,
        endTime,
        location,
        notes,
      });
      onEventUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update event:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.familyId) return;
    const confirmed = window.confirm('Delete this event?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, `families/${user.familyId}/events/${event.id}`));
      onEventUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl">
          &times;
        </button>
        <h2 className="text-xl font-bold">Edit Event</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location (optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between pt-2">
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