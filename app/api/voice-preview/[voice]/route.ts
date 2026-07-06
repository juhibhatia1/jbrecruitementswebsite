import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { OPENAI_REALTIME_VOICES } from "@/lib/interview/providers/openai-realtime-provider";

const PREVIEW_TEXT =
  "Hello! I'm your AI interviewer for today. I'll be asking you a mix of technical and behavioural questions. Please answer naturally, and take your time — there's no rush.";

type RouteContext = { params: Promise<{ voice: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { voice } = await params;

  if (!OPENAI_REALTIME_VOICES.includes(voice as (typeof OPENAI_REALTIME_VOICES)[number])) {
    return NextResponse.json({ error: "Unknown voice" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voice as Parameters<typeof openai.audio.speech.create>[0]["voice"],
      input: PREVIEW_TEXT,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        // Cache 7 days in browser, 1 day CDN — voices don't change often
        "Cache-Control": "public, max-age=604800, s-maxage=86400",
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error("[voice-preview] TTS error:", err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
  }
}
