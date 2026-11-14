// Cloudflare Pages Function. Same request and response as api/grammar.ts (Vercel).

// Card text is short. These limits stop large requests from running up API cost.
const MAX_TEXT_LENGTH = 2000;
const MAX_INSTRUCTION_LENGTH = 500;

interface Env {
  ANTHROPIC_API_KEY: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: 'Invalid JSON' });
    }

    const { text, instruction } = (body ?? {}) as { text?: unknown; instruction?: unknown };

    if (typeof text !== 'string' || text.trim().length === 0) {
      return json(400, { error: 'No text provided' });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return json(413, { error: 'Text is too long' });
    }
    if (instruction !== undefined && typeof instruction !== 'string') {
      return json(400, { error: 'Instruction must be text' });
    }
    if (typeof instruction === 'string' && instruction.length > MAX_INSTRUCTION_LENGTH) {
      return json(413, { error: 'Instruction is too long' });
    }

    const apiKey = env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return json(500, { error: 'API not configured' });
    }

    const prompt = instruction
      ? `${instruction} Return ONLY the rewritten text with no explanation, no preamble, and no quotation marks.

Text to rewrite:
${text}`
      : `Fix any grammar, spelling, or punctuation errors in the text below. Return ONLY the corrected text with no explanation, no preamble, and no quotation marks.

Text to fix:
${text}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return json(500, { error: 'AI request failed' });
    }

    const data = (await response.json()) as { content?: { text?: string }[] };
    const corrected = data.content?.[0]?.text ?? text;

    return json(200, { corrected });
  } catch (err) {
    console.error('Grammar API error:', err);
    return json(500, { error: 'Something went wrong' });
  }
};
