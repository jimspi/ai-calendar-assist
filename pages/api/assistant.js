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

    const prompt = `
You are an AI calendar assistant. Summarize the user's schedule for ${selectedDate} based on this event list.
- Start with a quick overview of how busy or free the day is.
- Mention key events (title + time).
- Suggest time gaps where they can do focused work.
- Point out any back-to-back or overlapping events that may be stressful or need adjusting.

Calendar events (JSON):
${JSON.stringify(events, null, 2)}
`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
    });

    const result = await aiResponse.json();
    const summary = result.choices?.[0]?.message?.content || 'No summary available.';

    res.status(200).json({ summary });
  } catch (error) {
    console.error('AI Assistant error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to summarize events' });
  }
}



