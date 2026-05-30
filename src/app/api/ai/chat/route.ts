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
    const { messages, subject, learningMode } = await req.json();
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

    const modelNames = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let lastError: any = null;

    const history = buildGeminiHistory(messages);

    // Build subject and mode-specific dynamic system instructions
    let dynamicSystemPrompt = SYSTEM_PROMPT.trim();
    if (subject && subject !== 'all') {
      dynamicSystemPrompt += `\nYou are currently tutoring the student in the subject: ${subject.toUpperCase()}. Focus all explanations, concepts, context, and terminology specifically on the MSCE syllabus for ${subject}.`;
    }
    if (learningMode === 'revision') {
      dynamicSystemPrompt += `\nYour learning mode is: EXAM REVISION. Provide concise revision summaries, highlight key points, list potential MSCE exam questions, and offer exam-taking tips and tricks. Use bullet points and lists to make it scannable.`;
    } else if (learningMode === 'quiz') {
      dynamicSystemPrompt += `\nYour learning mode is: INTERACTIVE QUIZ. You MUST ask a multiple-choice question testing the student's knowledge of the current topic. Format your output strictly using the custom 'yaza-quiz' block like so:
\`\`\`yaza-quiz
{
  "question": "Insert your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Provide a simple, clear explanation of why the correct option is right."
}
\`\`\`
Do not include other conversational text in the message besides the yaza-quiz block when presenting a quiz. Give one question at a time.`;
    } else {
      dynamicSystemPrompt += `\nYour learning mode is: CONCEPT EXPLAINER. Explain topics from basic principles, break down complex formulas or ideas step-by-step, and use intuitive metaphors and real-world Malawi references (like Lake Malawi, Lilongwe/Blantyre, local farming, mobile money, etc.) to make learning engaging and local.`;
    }

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: dynamicSystemPrompt,
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
