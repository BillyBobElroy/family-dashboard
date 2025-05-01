'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { AddEventModal } from '@/components/calendar/AddEventModal';
import { EditEventModal } from '@/components/calendar/EditEventModal';
import { FamilyLegend } from '@/components/calendar/FamilyLegend';

import { format, parse, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from '@/hook/useFirebaseUser';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => 0,
  getDay,
  locales,
});

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  notes?: string;
  createdBy?: string;
  color?: string;
};

type Member = {
  id: string;
  displayName: string;
  color?: string;
};

type MemberProgress = {
  [memberId: string]: {
    total: number;
    completed: number;
  };
};

export default function FamilyCalendarPage() {
  const { user } = useFirebaseUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [progress, setProgress] = useState<MemberProgress>({});
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const loadEvents = useCallback(async () => {
    if (!user?.familyId) return;

    const membersSnap = await getDocs(collection(db, `families/${user.familyId}/members`));
    const memberMap: { [id: string]: string } = {};
    const memberList: Member[] = membersSnap.docs.map(doc => {
      const data = doc.data();
      const color = data.color || '#3B82F6';
      memberMap[doc.id] = color;
      return {
        id: doc.id,
        displayName: data.displayName || 'Unnamed',
        color,
      };
    });
    setMembers(memberList);

    const eventsSnap = await getDocs(collection(db, `families/${user.familyId}/events`));
    const rawEvents: Event[] = eventsSnap.docs.map(doc => {
      const raw = doc.data();
      const date = raw.date || '';
      const startTime = raw.startTime || '00:00';
      const endTime = raw.endTime || raw.startTime || '01:00';

      return {
        id: doc.id,
        title: raw.title || 'Untitled',
        start: new Date(`${date}T${startTime}`),
        end: new Date(`${date}T${endTime}`),
        location: raw.location,
        notes: raw.notes,
        createdBy: raw.createdBy,
        color: memberMap[raw.createdBy] || '#3B82F6',
      };
    });

    setEvents(rawEvents);

    const todayISO = new Date().toISOString().split('T')[0];
    const eventProgress: MemberProgress = {};

    for (const member of memberList) {
      const memberEventsToday = rawEvents.filter(event =>
        event.createdBy === member.id &&
        event.start.toISOString().startsWith(todayISO)
      );

      eventProgress[member.id] = {
        completed: memberEventsToday.length,
        total: memberEventsToday.length,
      };
    }

    setProgress(eventProgress);
  }, [user?.familyId]);

  const eventStyleGetter = (event: Event) => {
    const backgroundColor = event.color || '#3B82F6';
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        color: '#fff',
        border: 'none',
        padding: '2px 6px',
      },
    };
  };

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="min-h-screen bg-white p-4">
      <h2 className="text-xl font-bold mb-4">Family Calendar</h2>

      <FamilyLegend members={members} progress={progress} />

      <div className="bg-white rounded-lg shadow relative">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(newView) => setView(newView as 'month' | 'week' | 'day')}
          views={{ month: true, week: true, day: true }}
          style={{ height: '80vh' }}
          popup
          toolbar
          onSelectEvent={(event) => setSelectedEvent(event)}
          eventPropGetter={eventStyleGetter}
        />

        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-3xl flex items-center justify-center hover:bg-blue-700 transition"
          aria-label="Add event"
        >
          +
        </button>

        {showAddModal && (
          <AddEventModal
            onClose={() => setShowAddModal(false)}
            onEventAdded={loadEvents}
          />
        )}
        {selectedEvent && (
          <EditEventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEventUpdated={loadEvents}
          />
        )}
      </div>
    </div>
  );
}