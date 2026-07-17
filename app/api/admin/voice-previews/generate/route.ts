import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { OPENAI_REALTIME_VOICES } from "@/lib/interview/providers/openai-realtime-provider";

const PREVIEW_TEXT =
  "Hello! I'm your AI interviewer for today. I'll be asking you a mix of technical and behavioural questions. Please answer naturally, and take your time — there's no rush.";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  const voicesDir = path.join(process.cwd(), "public", "voices");
  if (!existsSync(voicesDir)) {
    await mkdir(voicesDir, { recursive: true });
  }

  const openai = new OpenAI({ apiKey });
  const results: Record<string, "ok" | "error"> = {};

  for (const voice of OPENAI_REALTIME_VOICES) {
    try {
      const mp3 = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: voice as Parameters<typeof openai.audio.speech.create>[0]["voice"],
        input: PREVIEW_TEXT,
        response_format: "mp3",
      });
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await writeFile(path.join(voicesDir, `${voice}.mp3`), buffer);
      results[voice] = "ok";
      console.log(`[voice-gen] ${voice}.mp3 written (${buffer.byteLength} bytes)`);
    } catch (err) {
      console.error(`[voice-gen] Failed for ${voice}:`, err);
      results[voice] = "error";
    }
  }

  const failed = Object.entries(results).filter(([, v]) => v === "error").map(([k]) => k);
  return NextResponse.json({
    results,
    message: failed.length === 0
      ? "All voices generated successfully. Commit public/voices/ to git to persist across deploys."
      : `Generated with errors. Failed: ${failed.join(", ")}`,
  });
}
