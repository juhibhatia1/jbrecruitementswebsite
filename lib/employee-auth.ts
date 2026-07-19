import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export const EMPLOYEE_SESSION_COOKIE = "jb_employee_session";

const DEFAULT_EMPLOYEE_USERNAME = "employee";
const DEFAULT_EMPLOYEE_PASSWORD = "employee123";
const PRODUCTION_EMPLOYEE_LOGIN_ERROR =
  "Employee login is not configured for production. Set EMPLOYEE_USERNAME and EMPLOYEE_PASSWORD in your environment.";

const systemJwtSecret =
  process.env.JWT_SECRET ||
  process.env.EMPLOYEE_SESSION_TOKEN ||
  (process.env.NODE_ENV === "production"
    ? randomBytes(32).toString("hex")
    : "dev_fallback_secret_for_local_use_only_12345");

export function getEmployeeUsername(): string {
  return process.env.EMPLOYEE_USERNAME || DEFAULT_EMPLOYEE_USERNAME;
}

export function getEmployeePassword(): string | null {
  const password = process.env.EMPLOYEE_PASSWORD;
  if (
    process.env.NODE_ENV === "production" &&
    (!password || password === DEFAULT_EMPLOYEE_PASSWORD)
  ) {
    return null;
  }
  return password || DEFAULT_EMPLOYEE_PASSWORD;
}

export function getEmployeeAuthConfigError(): string | null {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const username = process.env.EMPLOYEE_USERNAME;
  const password = process.env.EMPLOYEE_PASSWORD;
  if (!username || !password || password === DEFAULT_EMPLOYEE_PASSWORD) {
    return PRODUCTION_EMPLOYEE_LOGIN_ERROR;
  }

  return null;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export function signJwt(
  payload: object,
  secret: string,
  expiresInSeconds: number = 28800,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac("sha256", secret)
    .update(signatureInput)
    .digest("base64url");

  return `${signatureInput}.${signature}`;
}

export function verifyJwt(token: string, secret: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;

    const expectedSignature = createHmac("sha256", secret)
      .update(signatureInput)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expSigBuf = Buffer.from(expectedSignature);

    if (
      sigBuf.length !== expSigBuf.length ||
      !timingSafeEqual(sigBuf, expSigBuf)
    ) {
      return null;
    }

    const parsedPayload = JSON.parse(base64UrlDecode(payload));
    if (parsedPayload.exp && parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

export function generateEmployeeSessionToken(username: string): string {
  return signJwt({ username }, systemJwtSecret);
}

export function getSessionToken(): string {
  return generateEmployeeSessionToken(getEmployeeUsername());
}

export function isValidEmployeeCredentials(
  username: string,
  password: string,
): boolean {
  const expectedPassword = getEmployeePassword();
  if (!expectedPassword) {
    return false;
  }

  return username === getEmployeeUsername() && password === expectedPassword;
}

export function isValidEmployeeSessionToken(token?: string | null): boolean {
  if (!token) {
    return false;
  }

  const payload = verifyJwt(token, systemJwtSecret);
  return payload !== null && payload.username === getEmployeeUsername();
}
