'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { collection, getDocs } from 'firebase/firestore';
import { format, isAfter } from 'date-fns';

export function UpcomingEvents() {
  const { user } = useFirebaseUser();
  const [events, setEvents] = useState<{ title: string; start: Date }[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.familyId) return;
      const snap = await getDocs(collection(db, `families/${user.familyId}/events`));
      const now = new Date();
      const upcoming = snap.docs
        .map(doc => {
          const data = doc.data();
          const date = data.date || '';
          const time = data.startTime || '00:00';
          return {
            title: data.title || 'Untitled',
            start: new Date(`${date}T${time}`),
          };
        })
        .filter(event => isAfter(event.start, now))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(0, 5); // limit to next 5

      setEvents(upcoming);
    };
    fetchEvents();
  }, [user?.familyId]);

  return (
    <div className="p-4 bg-yellow-50 border rounded-xl shadow-sm">
      <div className="text-lg font-medium mb-3">Upcoming Events</div>
      {events.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming events</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span className="font-semibold">{event.title}</span>
              <span className="text-gray-600">{format(event.start, 'PPpp')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
