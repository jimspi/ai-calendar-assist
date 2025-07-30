import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import axios from 'axios';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const calendarListRes = await axios.get(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );

    console.log('🔍 Available calendars:', JSON.stringify(calendarListRes.data.items, null, 2));
    res.status(200).json({ calendars: calendarListRes.data.items });
  } catch (error) {
    console.error('Failed to fetch calendars:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch calendar list' });
  }
}
