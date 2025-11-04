// lib/ai.ts
import OpenAI from "openai";

// Server-only OpenAI client
// ✅ Do NOT import this in client-side components
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAI(message: string) {
  if (!message) {
    throw new Error("Message is required");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    return completion.choices[0].message?.content || "";
  } catch (err: any) {
    console.error("OpenAI Error:", err.message);
    throw new Error(err.message || "OpenAI API call failed");
  }
}
