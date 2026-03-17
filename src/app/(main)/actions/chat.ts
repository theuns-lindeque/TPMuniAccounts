"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAppSettings } from "./settings";

const SYSTEM_PROMPT = `
You are the TPMuni Analysis Engine, a specialized AI consultant for commercial property municipal auditing in South Africa.
Your expertise includes:
- Electricity (Basic & Usage charges, ToU tariffs, kVa Demand)
- Water & Sewerage/Effluent
- Assessment Rates
- Solar implementation & Landlord Recoveries (Solar is landlord recovery only)
- Identifying recovery deficits (gaps between municipal bills and tenant recoveries)
- Analyzing utility management company reports

Tone: Professional, high-density, technical, technical (blueprint-style), and data-driven. 
Refer to "Nodes", "Diagnostics", and "Audits".
Keep responses concise and actionable.
`;

export async function chatAction(
  message: string,
  history: { role: string; content: string }[],
) {
  try {
    const settings = await getAppSettings();
    const chatModel = settings?.chatModel || "gemini-3-flash";

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    );
    const model = genAI.getGenerativeModel({ model: chatModel });

    const chat = model.startChat({
      history: history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Prepend system prompt context if this is a fresh start or ensure it's integrated
    const prompt =
      history.length === 1
        ? `${SYSTEM_PROMPT}\n\nUser Question: ${message}`
        : message;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw new Error("Failed to reach AI Analysis Engine.");
  }
}
