import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, language } = req.body;
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
          content: `Fix the grammar and spelling of this text written in ${language || 'English'}. 
Keep the same meaning and tone. Only fix grammar, spelling, and punctuation errors.
Return ONLY the corrected text, nothing else. No explanations.

Text: "${text}"`
        }]
      })
    });

    const data = await response.json();
    const corrected = data.content?.[0]?.text || text;
    return res.status(200).json({ corrected });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fix grammar' });
  }
}
