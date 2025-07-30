import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const getLocalDateString = (dateObj = new Date()) => {
    return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };

  const setToday = () => {
    const localDate = getLocalDateString();
    setSelectedDate(localDate);
  };

  useEffect(() => {
    if (!session || !selectedDate) return;

    fetch(`/api/events?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.events) setEvents(data.events);
      });
  }, [session, selectedDate]);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    const res = await fetch(`/api/assistant?date=${selectedDate}`);
    const data = await res.json();
    setAiSummary(data.summary);
    setLoadingSummary(false);
  };

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
        <div className="text-center w-full max-w-lg">
          <p className="text-xl mb-4">Welcome, {session.user?.name}!</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 py-2 px-4 rounded-xl hover:bg-red-600 mb-6"
          >
            Sign out
          </button>

          <button
            onClick={setToday}
            className="bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition mb-4"
          >
            Show Today's Events
          </button>

          <div className="mb-4">
            <label className="mr-2">Pick a date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-black px-2 py-1 rounded"
            />
          </div>

          {selectedDate && events.length === 0 ? (
            <p>No events found for this date.</p>
          ) : (
            events.length > 0 && (
              <div className="text-left bg-white text-black p-4 rounded-xl">
                <h2 className="text-lg font-bold mb-2">Events on {selectedDate}:</h2>
                <ul>
                  {events.map(event => (
                    <li key={event.id} className="mb-2">
                      <strong>{event.summary || 'No Title'}</strong><br />
                      {event.start?.dateTime?.slice(11, 16) || 'All day'} - {event.end?.dateTime?.slice(11, 16) || ''}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {selectedDate && (
            <>
              <button
                onClick={fetchSummary}
                className="bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition mt-6"
              >
                Generate AI Summary
              </button>

              {loadingSummary && <p className="mt-4">Summarizing your day...</p>}

              {aiSummary && (
                <div className="bg-black/20 mt-4 p-4 rounded-xl text-left">
                  <h3 className="text-lg font-bold mb-2">AI Assistant Summary:</h3>
                  <p>{aiSummary}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}




