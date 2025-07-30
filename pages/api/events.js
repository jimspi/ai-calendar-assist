// pages/api/events.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import axios from 'axios';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const selectedDate = req.query.date || new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const dayStart = new Date(`${selectedDate}T00:00:00`);
    const dayEnd = new Date(`${selectedDate}T23:59:59`);

    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params: {
          timeMin: dayStart.toISOString(),
          timeMax: dayEnd.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        },
      }
    );

    const allEvents = response.data.items || [];

    const matched = [];
    const unmatched = [];

    for (const event of allEvents) {
      const raw = event.start?.dateTime || event.start?.date;
      if (!raw) {
        unmatched.push({ reason: 'no start', event });
        continue;
      }

      const eventDate = new Date(raw);
      const userOffset = new Date().getTimezoneOffset(); // minutes
      const localAdjusted = new Date(eventDate.getTime() - userOffset * 60000)
        .toISOString()
        .slice(0, 10);

      const matches = localAdjusted === selectedDate;

      console.log(`🕒 EVENT "${event.summary || 'No Title'}" → Raw: ${raw} → Adjusted: ${localAdjusted} → Match: ${matches}`);

      if (matches) {
        matched.push(event);
      } else {
        unmatched.push({ adjusted: localAdjusted, raw, event });
      }
    }

    res.status(200).json({ events: matched, debug: unmatched });
  } catch (error) {
    console.error('💥 Error fetching calendar events:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}



