export async function rewriteMessage(
  text: string,
  tone: 'professional' | 'casual'
): Promise<string> {
  const toneInstruction =
    tone === 'professional'
      ? 'Rewrite this message in a clear, professional, and formal tone.'
      : 'Rewrite this message in a friendly, casual, and conversational tone.';

  const response = await fetch('/api/grammar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      tone,
      instruction: toneInstruction,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to rewrite message');
  }

  const data = await response.json();
  return data.corrected ?? text;
}