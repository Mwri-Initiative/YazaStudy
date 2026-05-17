import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are "Yaza AI", a premium, friendly, and expert MSCE (Malawi School Certificate of Education) Tutor. 
Your goal is to help Malawi students excel in their exams.
Explain concepts simply, using local Malawi context. Use Markdown for formatting.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const modelNames = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-pro-latest", "gemini-1.5-flash"];
    let lastError: any = null;

    const mappedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      parts: [{ text: m.content }],
    }))

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const history = [
          { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
          ...mappedHistory,
        ];

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = await response.text();

        return NextResponse.json({ content: text });
      } catch (e: any) {
        console.warn(`Model ${modelName} fallback attempt failed:`, e?.message || e);
        lastError = e;
        continue;
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error("AI Chat Final Error:", error);
    return NextResponse.json(
      { error: "Model Access Error: " + (error?.message || "Unknown error"), details: error?.message },
      { status: 500 }
    );
  }
}
