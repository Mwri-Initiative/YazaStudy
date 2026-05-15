import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are "Yaza AI", a premium, friendly, and expert MSCE (Malawi School Certificate of Education) Tutor. 
Your goal is to help Malawi students excel in their exams.
Explain concepts simply, using local Malawi context. Use Markdown for formatting.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    // These model names were confirmed available via your API diagnostic list
    const modelNames = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-pro-latest", "gemini-1.5-flash"];
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const history = [
          { role: "user", parts: [{ text: "System Instruction: " + SYSTEM_PROMPT }] },
          { role: "model", parts: [{ text: "Understood. I am your MSCE expert tutor ready to help." }] },
          ...messages.slice(0, -1).map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
        ];

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text });
      } catch (e: any) {
        console.warn(`Model ${modelName} fallback attempt failed:`, e.message);
        lastError = e;
        continue; 
      }
    }

    throw lastError; 
  } catch (error: any) {
    console.error("AI Chat Final Error:", error);
    return NextResponse.json(
      { error: "Model Access Error: " + (error.message || "Unknown error"), details: error.message },
      { status: 500 }
    );
  }
}
