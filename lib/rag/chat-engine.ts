import Groq from "groq-sdk";
import { prisma } from "../prisma";
import { searchSimilarChunks } from "./vector-store";
import { getSystemContextText } from "./system-context";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const DEFAULT_MODEL = "llama-3.3-70b-specdec"; // default fast and smart model on Groq

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatEngineResponse {
  response: string;
  suggestedQuestions: string[];
}

/**
 * Main chat engine function that:
 * 1. Persists conversation to Neon DB
 * 2. Fetches relevant documents from vector store
 * 3. Builds system prompt incorporating site context & vector chunks
 * 4. Calls Groq with JSON Mode
 * 5. Returns parsed chat reply and suggested follow-ups
 */
export async function handleChatMessage(
  sessionId: string,
  userMessage: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<ChatEngineResponse> {
  const modelId = process.env.GROQ_MODEL || DEFAULT_MODEL;

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not defined in environment variables.");
    return {
      response: "Hello! I am having trouble connecting to my brain (Groq API Key missing). Please check with the administrator.",
      suggestedQuestions: ["How can I contact Juhi Bhatia?"]
    };
  }

  // 1. Fetch or initialize the conversation history from DB
  let dbConversation = await prisma.chatConversation.findUnique({
    where: { sessionId },
  });

  let history: ChatMessage[] = [];
  if (dbConversation && dbConversation.messages) {
    history = dbConversation.messages as unknown as ChatMessage[];
  }

  // Limit history length to keep context window clean (last 10 messages)
  const conversationHistory = history.slice(-10);

  // 2. Perform Vector Search for relevant knowledge chunks
  const similarChunks = await searchSimilarChunks(userMessage, 4);
  const contextText = similarChunks
    .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.documentTitle}]\n${chunk.content}`)
    .join("\n\n");

  // 3. Retrieve Hardcoded Site Context
  const siteContext = getSystemContextText();

  // 4. Construct System Prompt
  const systemPrompt = `You are the friendly, professional, and engaging AI Career Assistant for "JB Recruitment Solutions" (a recruitment brand by Juhi Bhatia). Your goal is to represent Juhi's brand warmly, assist job seekers and companies, and guide them towards hiring Juhi or purchasing her services.

STRICT INSTRUCTIONS:
1. Tone: Friendly, highly engaging, warm, professional, and encouraging. Never sound like a generic computer program. Show interest in the user's career!
2. Answer visitor questions accurately using the context provided below.
3. If the answer is not in the context, politely explain that you don't have that specific information and offer them to contact us at contact@jbrecruitments.com.
4. Keep answers extremely short, highly direct, and concise (under 2-3 short sentences, or 60-80 words maximum). Avoid writing long essays or detailed paragraphs. Keep lists extremely brief.
5. Always offer exactly 2 follow-up suggestions/questions that are contextually relevant to the current point in conversation. Keep each question extremely short, concise, and direct (between 3 to 6 words maximum).
6. You MUST return your output in the following JSON format:
{
  "response": "your short conversational response here (markdown supported, friendly tone, concise)",
  "suggestedQuestions": ["question suggestion 1", "question suggestion 2"]
}

=== CONTEXT ABOUT THE SITE (JUHI & SERVICES) ===
${siteContext}

=== ADDITIONAL KNOWLEDGE BASE DOCUMENT CONTEXT ===
${contextText || "No additional document context matches this query. Answer from site context."}

Response format is strictly JSON.`;

  // 5. Build messages array for the LLM
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    // 6. Call Groq API in JSON mode
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: modelId,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    let jsonResponse: ChatEngineResponse;

    try {
      jsonResponse = JSON.parse(content);
      if (!jsonResponse.response) {
        jsonResponse = {
          response: "I'm here to help! What questions do you have about Juhi Bhatia or our career services?",
          suggestedQuestions: ["Who is Juhi Bhatia?", "What services do you offer?"]
        };
      }
    } catch (parseError) {
      console.error("Failed to parse Groq response as JSON:", content, parseError);
      jsonResponse = {
        response: content, // fallback
        suggestedQuestions: ["What services do you offer?", "How can I contact Juhi?"]
      };
    }

    // 7. Save conversation to Neon DB
    const updatedMessages = [
      ...history,
      { role: "user", content: userMessage, timestamp: new Date().toISOString() },
      {
        role: "assistant",
        content: jsonResponse.response,
        timestamp: new Date().toISOString(),
        suggestedQuestions: jsonResponse.suggestedQuestions // store metadata if needed
      },
    ];

    await prisma.chatConversation.upsert({
      where: { sessionId },
      create: {
        sessionId,
        messages: updatedMessages as any,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      },
      update: {
        messages: updatedMessages as any,
        ipAddress: meta?.ipAddress || null,
        userAgent: meta?.userAgent || null,
      },
    });

    return jsonResponse;
  } catch (error) {
    console.error("Groq Chat completion error:", error);
    return {
      response: "I apologize, but I encountered an error while processing your request. Please try again shortly or contact Juhi directly at contact@jbrecruitments.com.",
      suggestedQuestions: ["How can I contact Juhi Bhatia?", "What services do you offer?"]
    };
  }
}
