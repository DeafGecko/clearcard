export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { text, tone, instruction } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = instruction
      ? `${instruction} Return ONLY the rewritten text with no explanation, no preamble, and no quotation marks.

Text to rewrite:
${text}`
      : `Fix any grammar, spelling, or punctuation errors in the text below. Return ONLY the corrected text with no explanation, no preamble, and no quotation marks.

Text to fix:
${text}`;

    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return new Response(
        JSON.stringify({ error: 'AI request failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const corrected = data.content?.[0]?.text ?? text;

    return new Response(
      JSON.stringify({ corrected }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error('Grammar API error:', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}