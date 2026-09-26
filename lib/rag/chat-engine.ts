import OpenAI from "openai";
import { prisma } from "../prisma";
import { searchSimilarChunks } from "./vector-store";
import { getSystemContextText, type Currency } from "./system-context";

let openai: OpenAI | null = null;
function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  if (!openai) {
    openai = new OpenAI({ apiKey: key });
  }
  return openai;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatEngineResponse {
  response: string;
  suggestedQuestions: string[];
}

function buildSystemPrompt(siteContext: string, contextText: string) {
  return `You are the friendly, professional, and engaging AI Career Assistant for "JB Recruitment Solutions" (a recruitment brand by Juhi Bhatia). Your goal is to represent Juhi's brand warmly, assist job seekers and companies, and guide them towards hiring Juhi or purchasing her services.

CRITICAL RULE:
To answer questions about packages, pricing, turnaround times, and company services, you MUST ONLY use the official website context and the additional relevant knowledge base documents provided below. Treat the retrieved knowledge base documents (RAG / ADDITIONAL RELEVANT KNOWLEDGE) as your primary source of detailed information for explaining what each service does and what is included. Use the official website context to verify high-level pricing, refund policy, and contact details. Do NOT invent or hallucinate other packages, pricing, services, or details. If a detail is not present in either context, explain that you do not have that information and suggest contacting contact@jbrecruitments.com.

=== OFFICIAL WEBSITE CONTEXT ===
${siteContext}

=== ADDITIONAL RELEVANT KNOWLEDGE ===
${contextText}

=== PRODUCT NOTE ===
The application currently serves around 2,000 daily active users.

STRICT INSTRUCTIONS:
1. Tone: Friendly, highly engaging, warm, professional, and encouraging. Never sound like a generic computer program. Show interest in the user's career!
2. ONLY answer visitor questions that are directly related to JB Recruitment Solutions, Juhi Bhatia, recruitment, career advisory services, job seeking, resume writing, or pricing. Do NOT answer any other general knowledge, political, historical, mathematical, coding, or unrelated queries.
3. If the user asks an irrelevant or unrelated question (e.g. asking about prime ministers, politics, general facts, unrelated coding/math, or people who are not Juhi Bhatia), or if the answer is not found in the provided contexts, politely and friendly explain that you only have knowledge about JB Recruitment Solutions, Juhi Bhatia, and our career services, and decline to answer. Suggest they contact contact@jbrecruitments.com for other inquiries.
4. If a user asks for open roles or how to apply for jobs, respond with a warm, positive, and encouraging tone. Explain that while we do not publish active listings directly on our website, we work closely with clients to fill premium opportunities and continuously review talent for placement. Encourage them to send their resume to contact@jbrecruitments.com so we can consider them for current and upcoming client openings. Guide them to boost their profile using our career optimization packages, and provide this exact markdown link: [Explore Career Services](/job-seekers#services). NEVER use negative phrasing like "we do not host jobs" or "we do not have a careers page". Always focus on review opportunities and profile optimization.
5. Keep answers short, direct, and concise (under 3-4 sentences, or 80-100 words maximum). Avoid writing long essays or detailed paragraphs. Keep lists extremely brief.
6. Prioritize retrieved knowledge base details: When explaining how our services work or what is included, you MUST explicitly mention the unique details, terminology, and process steps described in the retrieved knowledge base documents (RAG / ADDITIONAL RELEVANT KNOWLEDGE) (such as the "proper intake process", "keyword integration", and "impact-focused bullets" for resume writing). Avoid repeating the exact high-level bullet points from the website context if detailed RAG content is available.
7. Always offer exactly 1 follow-up suggestion/question that is contextually relevant, engaging, and interactive. Make the question descriptive, clear, and focused (between 8 to 12 words) so it remains highly interactive and engaging without being too long. CRITICAL: The suggested question MUST be phrased from the visitor's perspective — it should sound like something a job seeker or visitor would type to ask you. Do NOT phrase it as a question the bot asks the visitor. Examples of CORRECT user-perspective questions: "What does your Resume Optimization service include?", "How can you help me prepare for interviews?", "What are your pricing packages?". Examples of WRONG bot-perspective questions (never use these): "Are you looking for resume help?", "Have you explored our services?", "Would you like to learn more?".
8. When the user asks about Juhi Bhatia specifically (who she is, her background, experience, achievements, or coaching philosophy), answer warmly and naturally include this exact markdown link so they can follow her: [Juhi Bhatia on Instagram](https://www.instagram.com/juhibhatia_globalrecruiter/).
9. You MUST return your output in the following text format:
[your short conversational response here]

[Suggested Questions]: suggested question 1`;
}

function buildConversationTranscript(history: ChatMessage[], userMessage: string) {
  const transcript = history
    .slice(-10)
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
    .join("\n");

  return `${transcript ? `${transcript}\n` : ""}User: ${userMessage}`;
}

function parseAssistantContent(content: string) {
  let responseText = content;
  let suggestedQuestions: string[] = [];
  const delimiter = "[Suggested Questions]:";
  const parts = content.split(delimiter);

  if (parts.length > 1) {
    responseText = parts[0].trim();
    suggestedQuestions = parts[1]
      .split("|")
      .map((question) => question.trim())
      .filter(Boolean);
  }

  if (!responseText) {
    responseText = "I'm here to help! What questions do you have about Juhi Bhatia or our career services?";
    suggestedQuestions = ["Who is Juhi Bhatia?", "What career services do you provide?"];
  }

  return { responseText, suggestedQuestions };
}

async function buildChatContext(
  userMessage: string,
  meta?: { currency?: Currency },
) {
  const similarChunks = await searchSimilarChunks(userMessage, 4);
  const contextText = similarChunks
    .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.documentTitle}]\n${chunk.content}`)
    .join("\n\n");

  const siteContext = getSystemContextText(meta?.currency || "USD");
  const systemPrompt = buildSystemPrompt(siteContext, contextText);

  return { systemPrompt };
}

/**
 * Main chat engine function that:
 * 1. Persists conversation to Neon DB
 * 2. Fetches relevant documents from vector store
 * 3. Builds a system prompt incorporating site context & vector chunks
 * 4. Calls OpenAI Responses API for a streamed-capable chat response
 * 5. Returns parsed chat reply and suggested follow-ups
 */
export async function handleChatMessage(
  sessionId: string,
  userMessage: string,
  meta?: { ipAddress?: string; userAgent?: string; currency?: Currency },
): Promise<ChatEngineResponse> {
  const openaiClient = getOpenAIClient();
  if (!openaiClient) {
    return {
      response: "Hello! I am having trouble connecting to my brain. Please check back shortly.",
      suggestedQuestions: ["Who is Juhi Bhatia?", "What career services do you provide?"],
    };
  }

  const dbConversation = await prisma.chatConversation.findUnique({
    where: { sessionId },
  });

  const history: ChatMessage[] = dbConversation?.messages ? (dbConversation.messages as unknown as ChatMessage[]) : [];
  const { systemPrompt } = await buildChatContext(userMessage, meta);
  const input = buildConversationTranscript(history, userMessage);

  try {
    console.log("[ChatEngine] Attempting OpenAI Responses API request with", DEFAULT_MODEL);
    const response = await openaiClient.responses.create({
      model: DEFAULT_MODEL,
      instructions: systemPrompt,
      input,
      store: true,
    });

    const { responseText, suggestedQuestions } = parseAssistantContent(response.output_text || "");

    const updatedMessages = [
      ...history,
      { role: "user", content: userMessage, timestamp: new Date().toISOString() },
      {
        role: "assistant",
        content: responseText,
        timestamp: new Date().toISOString(),
        suggestedQuestions,
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

    return {
      response: responseText,
      suggestedQuestions,
    };
  } catch (error) {
    console.error("[ChatEngine] OpenAI Responses API request failed:", error);
    return {
      response: "I apologize, but I encountered an error while processing your request. Please try again shortly.",
      suggestedQuestions: ["Who is Juhi Bhatia?", "What career services do you provide?"],
    };
  }
}

/**
 * Streaming version of chat engine message processing.
 */
export async function handleChatMessageStream(
  sessionId: string,
  userMessage: string,
  meta?: { ipAddress?: string; userAgent?: string; currency?: Currency },
) {
  const openaiClient = getOpenAIClient();
  if (!openaiClient) {
    throw new Error("OpenAI API key is missing. Cannot process request.");
  }

  const dbConversation = await prisma.chatConversation.findUnique({
    where: { sessionId },
  });

  const history: ChatMessage[] = dbConversation?.messages ? (dbConversation.messages as unknown as ChatMessage[]) : [];
  const { systemPrompt } = await buildChatContext(userMessage, meta);
  const input = buildConversationTranscript(history, userMessage);

  console.log("[ChatEngine] Attempting OpenAI Responses stream with", DEFAULT_MODEL);
  const stream = openaiClient.responses.stream({
    model: DEFAULT_MODEL,
    instructions: systemPrompt,
    input,
    store: true,
  });

  return {
    stream,
    history,
  };
}
