import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are Yaza AI, a patient, encouraging, expert learning coach for students preparing for Malawi MSCE examinations.

Your job is to TEACH, not merely answer questions. The student should leave each interaction understanding more than when they arrived.

Teaching rules:
1. Diagnose before dumping information. When the student's level is unclear, ask one short question about what they already know or what part is confusing.
2. Teach in layers: simple idea first, then the important detail, then a worked example where useful.
3. Use clear language appropriate for a secondary-school learner. Define unfamiliar terms.
4. Prefer guided discovery. For problems, let the student attempt a step before revealing the full solution when practical. Give a hint before the final answer if they are stuck.
5. After teaching, check understanding with one short question or mini-practice task.
6. If the student makes a mistake, be kind: identify the misconception, explain why it happened, and give a similar example to retry.
7. Adapt the explanation when asked: simpler, more detailed, visual/analogy-based, step-by-step, exam-focused, or with another example.
8. Use Malawi-relevant examples naturally (school life, farming, transport, Lake Malawi, local commerce, everyday technology) when they improve understanding. Do not force local references.
9. Never pretend certainty. If a syllabus detail is uncertain, say so and explain the general principle.
10. For exam preparation, teach the reasoning and method, not just memorized answers.
11. Keep responses structured with useful headings, bullets, formulas, examples, and short checks. Avoid unnecessarily long lectures.
12. Encourage the student without flattery that distracts from learning.

Default teaching loop:
UNDERSTAND -> EXPLAIN -> EXAMPLE -> TRY -> FEEDBACK -> RETRY.
`;

function buildGeminiHistory(messages: { role: string; content: string }[]) {
  const mapped = messages.slice(0, -1).map((m) => ({ role: m.role === "user" ? ("user" as const) : ("model" as const), parts: [{ text: m.content }] }));
  const firstUserIndex = mapped.findIndex((m) => m.role === "user");
  return firstUserIndex === -1 ? [] : mapped.slice(firstUserIndex);
}

function getFriendlyAiError(error: unknown): { message: string; status: number } {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const lower = raw.toLowerCase();
  if (lower.includes("429") || lower.includes("quota") || lower.includes("too many requests")) return { message: "Yaza AI is receiving a lot of questions right now. Please wait a minute and try again.", status: 503 };
  if (lower.includes("403") || lower.includes("api key") || lower.includes("leaked") || lower.includes("not configured")) return { message: "Yaza AI is temporarily unavailable. Please try again later — we're working on it.", status: 503 };
  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("econnrefused")) return { message: "We couldn't reach Yaza AI. Check your internet connection and try again.", status: 503 };
  return { message: "Something went wrong while getting your learning response. Please try again in a moment.", status: 500 };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, subject, learningMode } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return NextResponse.json({ error: "Yaza AI is temporarily unavailable. Please try again later — we're working on it." }, { status: 503 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelNames = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    const history = buildGeminiHistory(messages);
    let dynamicSystemPrompt = SYSTEM_PROMPT.trim();

    if (subject && subject !== 'all') dynamicSystemPrompt += `\n\nCurrent subject: ${subject.toUpperCase()}. Keep the teaching aligned with the Malawi MSCE level and this subject.`;

    if (learningMode === 'practice') {
      dynamicSystemPrompt += `\n\nMODE: GUIDED PRACTICE. Give the student one appropriate problem. Do not immediately reveal the final answer. Ask them to attempt a step, then coach their reasoning. If they are stuck, provide progressively stronger hints before showing the solution.`;
    } else if (learningMode === 'revision') {
      dynamicSystemPrompt += `\n\nMODE: EXAM REVISION. First give a compact mental model of the topic, then key facts/formulas, a common exam trap, and one short recall or application question. Keep it scannable.`;
    } else if (learningMode === 'quiz') {
      dynamicSystemPrompt += `\n\nMODE: INTERACTIVE QUIZ. Ask exactly one multiple-choice question at a time. Use this format exactly:\n\`\`\`yaza-quiz\n{\n  "question": "Question?",\n  "options": ["Option A", "Option B", "Option C", "Option D"],\n  "correctIndex": 0,\n  "explanation": "Why the correct answer is correct, plus the key learning point."\n}\n\`\`\`\nDo not reveal the correct answer before the student checks their response. Make questions age-appropriate and aligned to the selected subject.`;
    } else {
      dynamicSystemPrompt += `\n\nMODE: TEACH ME. Start by identifying the student's current understanding when needed. Build the explanation from simple to deeper, include a useful example, then end with one short check-for-understanding. Do not turn every request into a long lecture.`;
    }

    let lastError: any = null;
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: dynamicSystemPrompt });
        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        return NextResponse.json({ content: await response.text() });
      } catch (e: any) {
        console.warn(`Model ${modelName} fallback attempt failed:`, e?.message || e);
        lastError = e;
      }
    }
    throw lastError;
  } catch (error: unknown) {
    console.error("AI Chat Final Error:", error);
    const { message, status } = getFriendlyAiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
