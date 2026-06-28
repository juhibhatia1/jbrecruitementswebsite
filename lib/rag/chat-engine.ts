import Groq from "groq-sdk";
import { prisma } from "../prisma";
import { searchSimilarChunks } from "./vector-store";
import { getSystemContextText, type Currency } from "./system-context";

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
 * 4. Calls Groq with strict formatting instructions
 * 5. Returns parsed chat reply and suggested follow-ups
 */
export async function handleChatMessage(
  sessionId: string,
  userMessage: string,
  meta?: { ipAddress?: string; userAgent?: string; currency?: Currency }
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

  // 3. Retrieve Hardcoded Site Context (filtered by visitor currency)
  const siteContext = getSystemContextText(meta?.currency || "USD");

  // 4. Construct System Prompt
  const systemPrompt = `You are the friendly, professional, and engaging AI Career Assistant for "JB Recruitment Solutions" (a recruitment brand by Juhi Bhatia). Your goal is to represent Juhi's brand warmly, assist job seekers and companies, and guide them towards hiring Juhi or purchasing her services.

CRITICAL RULE:
To answer questions about packages, pricing, turnaround times, and company services, you MUST ONLY use the official website context and the additional relevant knowledge base documents provided below. Treat the retrieved knowledge base documents (RAG / ADDITIONAL RELEVANT KNOWLEDGE) as your primary source of detailed information for explaining what each service does and what is included. Use the official website context to verify high-level pricing, refund policy, and contact details. Do NOT invent or hallucinate other packages, pricing, services, or details. If a detail is not present in either context, explain that you do not have that information and suggest contacting contact@jbrecruitments.com.

=== OFFICIAL WEBSITE CONTEXT ===
${siteContext}

=== ADDITIONAL RELEVANT KNOWLEDGE ===
${contextText}

STRICT INSTRUCTIONS:
1. Tone: Friendly, highly engaging, warm, professional, and encouraging. Never sound like a generic computer program. Show interest in the user's career!
2. ONLY answer visitor questions that are directly related to JB Recruitment Solutions, Juhi Bhatia, recruitment, career advisory services, job seeking, resume writing, or pricing. Do NOT answer any other general knowledge, political, historical, mathematical, coding, or unrelated queries.
3. If the user asks an irrelevant or unrelated question (e.g. asking about prime ministers, politics, general facts, unrelated coding/math, or people who are not Juhi Bhatia), or if the answer is not found in the provided contexts, politely and friendly explain that you only have knowledge about JB Recruitment Solutions, Juhi Bhatia, and our career services, and decline to answer. Suggest they contact contact@jbrecruitments.com for other inquiries.
4. If a user asks for open roles or how to apply for jobs, respond with a warm, positive, and encouraging tone. Explain that while we do not publish active listings directly on our website, we work closely with clients to fill premium opportunities and continuously review talent for placement. Encourage them to send their resume to contact@jbrecruitments.com so we can consider them for current and upcoming client openings. Guide them to boost their profile using our career optimization packages, and provide this exact markdown link: [Explore Career Services](/job-seekers). NEVER use negative phrasing like "we do not host jobs" or "we do not have a careers page". Always focus on review opportunities and profile optimization.
5. Keep answers short, direct, and concise (under 3-4 sentences, or 80-100 words maximum). Avoid writing long essays or detailed paragraphs. Keep lists extremely brief.
6. Prioritize retrieved knowledge base details: When explaining how our services work or what is included, you MUST explicitly mention the unique details, terminology, and process steps described in the retrieved knowledge base documents (RAG / ADDITIONAL RELEVANT KNOWLEDGE) (such as the "proper intake process", "keyword integration", and "impact-focused bullets" for resume writing). Avoid repeating the exact high-level bullet points from the website context if detailed RAG content is available.
7. Always offer exactly 2 follow-up suggestions/questions that are contextually relevant, engaging, and interactive. Make each question descriptive, clear, and focused (between 8 to 12 words) so they remain highly interactive and engaging without being too long (e.g., "How does the Superstar Shout-Out boost LinkedIn visibility?" or "Can you explain how we optimize resume keywords?").
8. You MUST return your output in the following text format:
[your short conversational response here]

[Suggested Questions]: suggested question 1 | suggested question 2`;

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
    // 6. Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: modelId,
      temperature: 0.5,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";
    
    // Parse complete response using the delimiter
    let responseText = content;
    let suggestedQuestions: string[] = [];
    const delimiter = "[Suggested Questions]:";
    const parts = content.split(delimiter);
    
    if (parts.length > 1) {
      responseText = parts[0].trim();
      suggestedQuestions = parts[1]
        .split("|")
        .map(q => q.trim())
        .filter(Boolean);
    }

    if (!responseText) {
      responseText = "I'm here to help! What questions do you have about Juhi Bhatia or our career services?";
      suggestedQuestions = ["Who is Juhi Bhatia?", "What services do you offer?"];
    }

    // 7. Save conversation to Neon DB
    const updatedMessages = [
      ...history,
      { role: "user", content: userMessage, timestamp: new Date().toISOString() },
      {
        role: "assistant",
        content: responseText,
        timestamp: new Date().toISOString(),
        suggestedQuestions: suggestedQuestions
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
      suggestedQuestions
    };
  } catch (error) {
    console.error("Groq Chat completion error:", error);
    return {
      response: "I apologize, but I encountered an error while processing your request. Please try again shortly or contact Juhi directly at contact@jbrecruitments.com.",
      suggestedQuestions: ["How can I contact Juhi Bhatia?", "What services do you offer?"]
    };
  }
}

/**
 * Streaming version of chat engine message processing.
 */
export async function handleChatMessageStream(
  sessionId: string,
  userMessage: string,
  meta?: { ipAddress?: string; userAgent?: string; currency?: Currency }
) {
  const modelId = process.env.GROQ_MODEL || DEFAULT_MODEL;

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
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

  // 3. Retrieve Hardcoded Site Context (filtered by visitor currency)
  const siteContext = getSystemContextText(meta?.currency || "USD");

  // 4. Construct System Prompt
  const systemPrompt = `You are the friendly, professional, and engaging AI Career Assistant for "JB Recruitment Solutions" (a recruitment brand by Juhi Bhatia). Your goal is to represent Juhi's brand warmly, assist job seekers and companies, and guide them towards hiring Juhi or purchasing her services.

CRITICAL RULE:
To answer questions about packages, pricing, turnaround times, and company services, you MUST ONLY use the official website context and the additional relevant knowledge base documents provided below. Treat the retrieved knowledge base documents (RAG / ADDITIONAL RELEVANT KNOWLEDGE) as your primary source of detailed information for explaining what each service does and what is included. Use the official website context to verify high-level pricing, refund policy, and contact details. Do NOT invent or hallucinate other packages, pricing, services, or details. If a detail is not present in either context, explain that you do not have that information and suggest contacting contact@jbrecruitments.com.

=== OFFICIAL WEBSITE CONTEXT ===
${siteContext}

=== ADDITIONAL RELEVANT KNOWLEDGE ===
${contextText}

STRICT INSTRUCTIONS:
1. Tone: Friendly, highly engaging, warm, professional, and encouraging. Never sound like a generic computer program. Show interest in the user's career!
2. ONLY answer visitor questions that are directly related to JB Recruitment Solutions, Juhi Bhatia, recruitment, career advisory services, job seeking, resume writing, or pricing. Do NOT answer any other general knowledge, political, historical, mathematical, coding, or unrelated queries.
3. If the user asks an irrelevant or unrelated question (e.g. asking about prime ministers, politics, general facts, unrelated coding/math, or people who are not Juhi Bhatia), or if the answer is not found in the provided contexts, politely and friendly explain that you only have knowledge about JB Recruitment Solutions, Juhi Bhatia, and our career services, and decline to answer. Suggest they contact contact@jbrecruitments.com for other inquiries.
4. We do NOT have a careers/jobs page, active job opening list, or direct job placement on our website. If a user asks for job openings or how to apply for jobs on our website, explain clearly and politely that we do not host a jobs/careers page or list active openings on our website. Suggest they send their resume to contact@jbrecruitments.com to be considered for client opportunities, or explore our career consulting packages by providing this exact markdown link: [Explore Career Services](/job-seekers).
5. Keep answers short, direct, and concise (under 3-4 sentences, or 80-100 words maximum). Avoid writing long essays or detailed paragraphs. Keep lists extremely brief.
6. Prioritize retrieved knowledge base details: When explaining how our services work or what is included, you MUST explicitly mention the unique details, terminology, and process steps described in the retrieved knowledge base documents (RAG / ADDITIONAL RELEVANT KNOWLEDGE) (such as the "proper intake process", "keyword integration", and "impact-focused bullets" for resume writing). Avoid repeating the exact high-level bullet points from the website context if detailed RAG content is available.
7. Always offer exactly 2 follow-up suggestions/questions that are contextually relevant, engaging, and interactive. Make each question descriptive, clear, and focused (between 8 to 12 words) so they remain highly interactive and engaging without being too long (e.g., "How does the Superstar Shout-Out boost LinkedIn visibility?" or "Can you explain how we optimize resume keywords?").
8. You MUST return your output in the following text format:
[your short conversational response here]

[Suggested Questions]: suggested question 1 | suggested question 2`;

  // 5. Build messages array for the LLM
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  // 6. Call Groq API in streaming mode
  const stream = await groq.chat.completions.create({
    messages: messages as any,
    model: modelId,
    temperature: 0.5,
    stream: true,
  });

  return {
    stream,
    history,
  };
}
