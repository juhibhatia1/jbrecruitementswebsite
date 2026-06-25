import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limiter";
import { handleChatMessageStream } from "@/lib/rag/chat-engine";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Public chat route for the floating widget.
 * POST /api/chat
 * Accepts { message: string, sessionId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // Rate limit: 20 requests per 1 minute
    if (isRateLimited(ip, 20, 60 * 1000)) {
      return NextResponse.json(
        {
          response: "You are asking questions a bit too fast! Please wait a moment and try again.",
          suggestedQuestions: []
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required." },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Call streaming helper
    const { stream: groqStream, history } = await handleChatMessageStream(sessionId, message, {
      ipAddress: ip,
      userAgent,
    });

    const encoder = new TextEncoder();
    let accumulatedContent = "";

    const responseStream = new ReadableStream({
      start(controller) {
        // Run as non-blocking async IIFE in background to stream chunks immediately
        (async () => {
          try {
            for await (const chunk of groqStream) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                accumulatedContent += text;
                // Format as Server-Sent Event
                const sseLine = `data: ${JSON.stringify({ chunk: text })}\n\n`;
                controller.enqueue(encoder.encode(sseLine));
              }
            }

            // Once streaming is complete, parse delimiter-based text and save to database
            try {
              let responseText = accumulatedContent;
              let suggestedQuestions: string[] = [];
              const delimiter = "[Suggested Questions]:";
              const parts = accumulatedContent.split(delimiter);

              if (parts.length > 1) {
                responseText = parts[0].trim();
                suggestedQuestions = parts[1]
                  .split("|")
                  .map((q) => q.trim())
                  .filter(Boolean);
              }

              const updatedMessages = [
                ...history,
                { role: "user", content: message, timestamp: new Date().toISOString() },
                {
                  role: "assistant",
                  content: responseText,
                  timestamp: new Date().toISOString(),
                  suggestedQuestions: suggestedQuestions,
                },
              ];

              await prisma.chatConversation.upsert({
                where: { sessionId },
                create: {
                  sessionId,
                  messages: updatedMessages as any,
                  ipAddress: ip,
                  userAgent,
                },
                update: {
                  messages: updatedMessages as any,
                  ipAddress: ip || null,
                  userAgent: userAgent || null,
                },
              });
            } catch (dbError) {
              console.error("Error parsing or saving streamed response in database:", dbError, accumulatedContent);
            }

            controller.close();
          } catch (error) {
            console.error("Stream generation error:", error);
            controller.error(error);
          }
        })();
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Error in public chat route:", error);
    return NextResponse.json(
      {
        response: "An unexpected error occurred. Please try again later.",
        suggestedQuestions: []
      },
      { status: 500 }
    );
  }
}

