import { Category } from "../types";

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

export async function generateSmartCard(prompt: string, categories: Category[]) {
  const text = await callClaude(
    `Generate a clear, professional communication card for a Deaf person based on: "${prompt}".
    Return ONLY a JSON object with "title", "content", and "category".
    Available categories: ${categories.join(", ")}.
    Pick the most relevant category. Keep content concise and easy to read on a screen.
    No markdown, no explanation, just the JSON object.`
  );

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { title: "My Message", content: prompt, category: categories[0] };
  }
}

export async function rewriteMessage(content: string, tone: "professional" | "casual") {
  const text = await callClaude(
    `Rewrite this message for a Deaf person's communication card. Tone: ${tone}.
    Keep it under 20 words, polite, and easy to read on screen.
    Return ONLY the rewritten message, nothing else.
    Original: "${content}"`
  );
  return text.trim() || content;
}
