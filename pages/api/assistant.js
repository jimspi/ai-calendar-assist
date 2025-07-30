// pages/api/assistant.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import axios from 'axios';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Step 1: Get today’s calendar events
    const eventsRes = await axios.get(
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

    const events = eventsRes.data.items;

    // Step 2: Create summary prompt
    const prompt = `
You are an AI calendar assistant. Given this list of today's events, summarize the user's day in plain English.
Then suggest any gaps where they could focus without interruptions.
Finally, point out any back-to-back events that might need rescheduling.
Only include what's useful. Avoid fluff.

Events JSON:
${JSON.stringify(events, null, 2)}
`;

    // Step 3: Send to OpenAI
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
    const summary = result.choices?.[0]?.message?.content || 'AI summary unavailable';

    res.status(200).json({ summary });
  } catch (err) {
    console.error('AI Assistant error:', err);
    res.status(500).json({ error: 'Failed to summarize events' });
  }
}
