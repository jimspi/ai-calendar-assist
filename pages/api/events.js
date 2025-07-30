import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (session) {
      fetch('/api/events')
        .then(res => res.json())
        .then(data => {
          if (data.events) setEvents(data.events);
        });
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
        <Calendar /> Calendar AI Assistant
      </h1>

      {!session ? (
        <button
          className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-gray-200 transition"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </button>
      ) : (
        <div className="text-center">
          <p className="text-xl mb-4">Welcome, {session.user?.name}!</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 py-2 px-4 rounded-xl hover:bg-red-600 mb-6"
          >
            Sign out
          </button>

          {events.length === 0 ? (
            <p>No events for today 🎉</p>
          ) : (
            <div className="text-left bg-white text-black p-4 rounded-xl max-w-md mx-auto">
              <h2 className="text-lg font-bold mb-2">Today's Events:</h2>
              <ul>
                {events.map(event => (
                  <li key={event.id} className="mb-2">
                    <strong>{event.summary}</strong><br />
                    {event.start?.dateTime?.slice(11, 16)} - {event.end?.dateTime?.slice(11, 16)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

