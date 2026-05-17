import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are "Yaza AI", a premium, friendly, and expert MSCE (Malawi School Certificate of Education) Tutor. 
Your goal is to help Malawi students excel in their exams.
Explain concepts simply, using local Malawi context. Use Markdown for formatting.
`;

function buildGeminiHistory(messages: { role: string; content: string }[]) {
  const mapped = messages.slice(0, -1).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: m.content }],
  }));

  // Gemini chat history must start with a user message (UI welcome is assistant-only).
  const firstUserIndex = mapped.findIndex((m) => m.role === "user");
  return firstUserIndex === -1 ? [] : mapped.slice(firstUserIndex);
}

function getFriendlyAiError(error: unknown): { message: string; status: number } {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const lower = raw.toLowerCase();

  if (lower.includes("429") || lower.includes("quota") || lower.includes("too many requests")) {
    return {
      message:
        "Yaza AI is receiving a lot of questions right now. Please wait a minute and try again.",
      status: 503,
    };
  }

  if (
    lower.includes("403") ||
    lower.includes("api key") ||
    lower.includes("leaked") ||
    lower.includes("not configured")
  ) {
    return {
      message:
        "Yaza AI is temporarily unavailable. Please try again later — we're working on it.",
      status: 503,
    };
  }

  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("econnrefused")) {
    return {
      message: "We couldn't reach Yaza AI. Check your internet connection and try again.",
      status: 503,
    };
  }

  return {
    message: "Something went wrong while getting your answer. Please try again in a moment.",
    status: 500,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.error("AI Chat: GEMINI_API_KEY is not configured");
      return NextResponse.json(
        {
          error:
            "Yaza AI is temporarily unavailable. Please try again later — we're working on it.",
        },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const modelNames = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-pro-latest"];
    let lastError: any = null;

    const history = buildGeminiHistory(messages);

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT.trim(),
        });

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
  } catch (error: unknown) {
    console.error("AI Chat Final Error:", error);
    const { message, status } = getFriendlyAiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
