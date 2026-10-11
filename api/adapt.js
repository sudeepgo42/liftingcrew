import { authorised, send } from './_lib.js';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

export default async function handler(req, res) {
  if (!authorised(req)) return send(res, 401, { error: 'Crew code required', code: 'locked' });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return send(res, 503, { error: 'AI is not set up' });
  const prompt = String((req.body || {}).prompt || '');
  if (!prompt || prompt.length > 60000) return send(res, 400, { error: 'Invalid request' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 4000,
        system: 'You update gym training programmes. Reply with a single JSON object only: no prose, no markdown fences.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (r.status === 429) return send(res, 429, { error: 'Rate limited', code: 'rate_limited' });
    if (!r.ok) { console.error(await r.text()); return send(res, 502, { error: 'AI request failed' }); }
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').replace(/```json|```/g, '').trim();
    const start = text.indexOf('{'), end = text.lastIndexOf('}');
    const result = JSON.parse(text.slice(start, end + 1));
    return send(res, 200, { result });
  } catch (err) {
    console.error(err);
    return send(res, 502, { error: 'AI response could not be read' });
  }
}
