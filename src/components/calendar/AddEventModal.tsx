'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useFirebaseUser } from '@/hook/useFirebaseUser';

export function AddEventModal({
  onClose,
  onEventAdded,
}: {
  onClose: () => void;
  onEventAdded: () => void;
}) {
  const { user } = useFirebaseUser();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!user?.familyId || !title || !date || !startTime || !endTime) {
      setError('Please complete all required fields.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, `families/${user.familyId}/events`), {
        title,
        date,
        startTime,
        endTime,
        location,
        notes,
        createdBy: user.uid,
      });

      onEventAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add event:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold">Add New Event</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Doctor Appointment"
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
            placeholder="e.g., Main Street Clinic"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Add extra details if needed..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Add Event'}
        </button>
      </div>
    </div>
  );
}