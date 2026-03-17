import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, language, tone } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a grammar correction assistant. Fix the grammar, spelling, and punctuation of the text below in ${language || 'English'}.

Rules:
- Keep the exact same meaning and intent
- Do NOT add any phrases about being Deaf, hearing loss, or communication preferences
- Do NOT add "I am Deaf" or "please write" or anything like that
- Just fix the grammar and spelling only
- Return ONLY a JSON array with 2-3 variations from ${tone === 'casual' ? 'casual' : tone === 'professional' ? 'professional' : 'both professional and casual'} tone
- Format: ["corrected version 1", "corrected version 2", "corrected version 3"]
- No explanation, no markdown, just the JSON array

Text to fix: "${text}"`
        }]
      })
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const variations = JSON.parse(clean);
    return res.status(200).json({ variations });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fix grammar' });
  }
}
