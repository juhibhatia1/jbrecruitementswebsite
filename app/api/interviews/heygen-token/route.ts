import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    console.error("HEYGEN_API_KEY environment variable is not defined.");
    return NextResponse.json(
      { error: "HeyGen API Key is missing. Please configure HEYGEN_API_KEY in your env variables." },
      { status: 400 }
    );
  }

  try {
    const avatarId = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || "josh_lite_3d_20240901";
    const voiceId = process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID || "26b204a0ebec4fe38c8c7c00ebba2eff"; // Josh standard voice

    const response = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "LITE",
        avatar_id: avatarId,
        avatar_persona: {
          voice_id: voiceId,
          language: "en",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen API returned an error:", response.status, errorText);
      return NextResponse.json(
        { error: `HeyGen API token error: ${response.statusText || response.status}` },
        { status: response.status }
      );
    }

    const json = await response.json();
    
    // Check both standard schemas
    const token = json.data?.session_token || json.session_token;
    const sessionId = json.data?.session_id || json.session_id;

    if (!token) {
      console.error("HeyGen API did not return a session token:", json);
      return NextResponse.json(
        { error: "Could not retrieve session token from HeyGen response." },
        { status: 500 }
      );
    }

    return NextResponse.json({ token, sessionId });
  } catch (error: any) {
    console.error("Error creating HeyGen session token:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create HeyGen session token" },
      { status: 500 }
    );
  }
}
