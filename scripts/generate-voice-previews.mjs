import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env.local manually
function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(join(root, ".env.local"));
loadEnv(join(root, ".env"));

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY not found in .env.local");
  process.exit(1);
}

const VOICES = ["alloy","ash","ballad","cedar","coral","echo","marin","sage","shimmer","verse"];
const PREVIEW_TEXT =
  "Hello! I'm your AI interviewer for today. I'll be asking you a mix of technical and behavioural questions. Please answer naturally, and take your time — there's no rush.";

const voicesDir = join(root, "public", "voices");
if (!existsSync(voicesDir)) {
  mkdirSync(voicesDir, { recursive: true });
  console.log("Created public/voices/");
}

for (const voice of VOICES) {
  const outPath = join(voicesDir, `${voice}.mp3`);
  if (existsSync(outPath)) {
    console.log(`  SKIP  ${voice}.mp3 (already exists)`);
    continue;
  }

  process.stdout.write(`  GEN   ${voice} ... `);
  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: PREVIEW_TEXT,
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`FAILED (${res.status}): ${err.slice(0, 120)}`);
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(outPath, buf);
    console.log(`OK (${buf.byteLength} bytes)`);
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
}

console.log("\nDone. Commit public/voices/ to git to persist permanently.");
