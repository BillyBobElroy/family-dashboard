// components/dashboard/UpcomingEvents.tsx
export function UpcomingEvents() {
    const events = [
      { title: "Dentist Appointment", time: "Today at 3:00 PM" },
      { title: "Soccer Practice", time: "Tomorrow at 5:30 PM" },
      { title: "Grandma's Birthday", time: "Sunday, All Day" },
    ];
  
    return (
      <div className="p-4 bg-yellow-50 border rounded-xl shadow-sm">
        <div className="text-lg font-medium mb-3">Upcoming Events</div>
        <ul className="space-y-2">
          {events.map((event, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span className="font-semibold">{event.title}</span>
              <span className="text-gray-600">{event.time}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  