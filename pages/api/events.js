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
          const selectedDate = req.query.date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const dayStart = new Date(`${selectedDate}T00:00:00`);
const dayEnd = new Date(`${selectedDate}T23:59:59`);

params: {
  timeMin: dayStart.toISOString(),
  timeMax: dayEnd.toISOString(),

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


