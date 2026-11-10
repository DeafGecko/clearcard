import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../../api/grammar';

const post = (body: unknown) =>
  new Request('http://localhost/api/grammar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('api/grammar: request handling', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key-123';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it('rejects non-POST methods with 405', async () => {
    const res = await handler(new Request('http://localhost/api/grammar', { method: 'GET' }));
    expect(res.status).toBe(405);
  });

  it('rejects empty text with 400', async () => {
    const res = await handler(post({ text: '   ' }));
    expect(res.status).toBe(400);
  });

  it('returns 500 when the API key is not configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = await handler(post({ text: 'hello' }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'API not configured' });
  });

  it('returns the corrected text from the model', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ content: [{ text: 'Hello there.' }] }), { status: 200 })
    );
    const res = await handler(post({ text: 'hello ther' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ corrected: 'Hello there.' });
  });

  it('sends the key only to the upstream API, never back to the client', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ content: [{ text: 'ok' }] }), { status: 200 })
    );
    const res = await handler(post({ text: 'hi' }));
    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers['x-api-key']).toBe('test-key-123');
    expect(await res.text()).not.toContain('test-key-123');
  });

  it('returns a generic error when the upstream API fails, without leaking details', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('secret upstream detail', { status: 500 })
    );
    const res = await handler(post({ text: 'hi' }));
    const body = await res.text();
    expect(res.status).toBe(500);
    expect(body).not.toContain('secret upstream detail');
  });

  it('rejects oversized text with 413 and never calls the API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await handler(post({ text: 'a'.repeat(200_000) }));
    expect(res.status).toBe(413);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects oversized instructions with 413', async () => {
    const res = await handler(post({ text: 'hi', instruction: 'x'.repeat(1000) }));
    expect(res.status).toBe(413);
  });

  it('returns 400 for malformed JSON instead of 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await handler(post('{not json'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when text is not a string', async () => {
    const res = await handler(post({ text: 12345 }));
    expect(res.status).toBe(400);
  });
});
