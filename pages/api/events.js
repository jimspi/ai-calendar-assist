// pages/api/events.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import axios from 'axios';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    console.error('No access token found in session');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const calendarRes = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params: {
          timeMin: new Date().toISOString(),
          timeMax: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        },
      }
    );

    res.status(200).json({ events: calendarRes.data.items });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch events from Google Calendar' });
  }
}


