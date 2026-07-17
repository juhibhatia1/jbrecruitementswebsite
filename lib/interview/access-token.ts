import { createHash, randomBytes } from "node:crypto";

const TOKEN_LENGTH_BYTES = 32;

export function generateInterviewAccessToken(): string {
  return randomBytes(TOKEN_LENGTH_BYTES).toString("base64url");
}

export function hashInterviewAccessToken(token: string): string {
  const secret = process.env.INTERVIEW_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Missing INTERVIEW_TOKEN_SECRET");
  }

  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}
