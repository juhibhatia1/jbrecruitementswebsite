import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limiter";
import { handleChatMessage } from "@/lib/rag/chat-engine";

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

    // Process chat response
    const result = await handleChatMessage(sessionId, message, {
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json(result);
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
