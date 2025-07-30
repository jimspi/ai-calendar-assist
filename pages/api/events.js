import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import axios from 'axios';

const getLocalDateString = (date = new Date()) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const selectedDate = req.query.date || getLocalDateString();
    const dayStart = new Date(`${selectedDate}T00:00:00`);
    const dayEnd = new Date(`${selectedDate}T23:59:59`);

    const calendarRes = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params: {
          timeMin: dayStart.toISOString(),
          timeMax: dayEnd.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          showDeleted: false,
        },
      }
    );

    const events = (calendarRes.data.items || []).filter((event) => {
      const eventStart = event.start.dateTime || event.start.date;
      return eventStart && eventStart.startsWith(selectedDate);
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch events from Google Calendar' });
  }
}

