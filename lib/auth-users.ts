import {
  createHmac,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from "crypto";

import { prisma } from "@/lib/prisma";

export type AuthRole = "ADMIN" | "EMPLOYEE";

export type AuthenticatedSession = {
  userId: string;
  email: string;
  role: AuthRole;
  fullName?: string | null;
  exp?: number;
};

const PASSWORD_PREFIX = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 150000;
const PASSWORD_KEY_LENGTH = 32;
const SESSION_EXPIRY_SECONDS = 60 * 60 * 8;
const DEFAULT_JWT_SECRET =
  "dev_fallback_secret_for_local_use_only_12345";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required for authenticated sessions.");
  }

  return DEFAULT_JWT_SECRET;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): string {
  let normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) {
    normalized += "=";
  }

  return Buffer.from(normalized, "base64").toString("utf8");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derivedKey = pbkdf2Sync(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    "sha256",
  );

  return [
    PASSWORD_PREFIX,
    PASSWORD_ITERATIONS,
    salt.toString("base64"),
    derivedKey.toString("base64"),
  ].join("$");
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [prefix, iterationsValue, saltValue, hashValue] =
      storedHash.split("$");

    if (
      prefix !== PASSWORD_PREFIX ||
      !iterationsValue ||
      !saltValue ||
      !hashValue
    ) {
      return false;
    }

    const iterations = Number.parseInt(iterationsValue, 10);
    if (!Number.isFinite(iterations) || iterations <= 0) {
      return false;
    }

    const salt = Buffer.from(saltValue, "base64");
    const expectedHash = Buffer.from(hashValue, "base64");
    const derivedHash = pbkdf2Sync(
      password,
      salt,
      iterations,
      expectedHash.length,
      "sha256",
    );

    return (
      derivedHash.length === expectedHash.length &&
      timingSafeEqual(derivedHash, expectedHash)
    );
  } catch {
    return false;
  }
}

export function signSessionToken(
  payload: Omit<AuthenticatedSession, "exp">,
  expiresInSeconds: number = SESSION_EXPIRY_SECONDS,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac("sha256", getJwtSecret())
    .update(signatureInput)
    .digest("base64url");

  return `${signatureInput}.${signature}`;
}

export function verifySessionToken(token?: string | null): AuthenticatedSession | null {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;
    const expectedSignature = createHmac("sha256", getJwtSecret())
      .update(signatureInput)
      .digest("base64url");

    const providedSignature = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    if (
      providedSignature.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(providedSignature, expectedSignatureBuffer)
    ) {
      return null;
    }

    const parsedPayload = JSON.parse(base64UrlDecode(payload)) as AuthenticatedSession;
    if (parsedPayload.exp && parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (
      !parsedPayload.userId ||
      !parsedPayload.email ||
      (parsedPayload.role !== "ADMIN" && parsedPayload.role !== "EMPLOYEE")
    ) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

export async function authenticateUserByRole(
  role: AuthRole,
  email: string,
  password: string,
): Promise<AuthenticatedSession | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.role !== role || !user.isActive) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };
}

export function normalizeAuthEmail(email: string): string {
  return normalizeEmail(email);
}

