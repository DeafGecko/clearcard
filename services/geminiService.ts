
import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSmartCard(prompt: string, categories: Category[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a clear, professional communication card text for a Deaf person based on this request: "${prompt}". 
      Keep it concise and readable. Return it as a JSON object with 'title', 'content', and 'category'. 
      Available categories: ${categories.join(', ')}. Pick the most relevant one or create a logical one if none fit perfectly.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["title", "content", "category"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini generation failed:", error);
    throw error;
  }
}

export async function rewriteMessage(content: string, tone: 'professional' | 'casual') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Rewrite the following message for a communication card used by a Deaf person to communicate with hearing people. 
      The tone should be ${tone}. 
      Keep it extremely concise (max 15-20 words), polite, and very easy to read on a screen. 
      Original message: "${content}"`,
    });

    return response.text?.trim() || content;
  } catch (error) {
    console.error("Gemini rewrite failed:", error);
    throw error;
  }
}
