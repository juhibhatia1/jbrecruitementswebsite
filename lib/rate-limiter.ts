import { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Global interval to automatically prune old records and prevent memory leaks
if (typeof global !== "undefined") {
  const globalAny = global as any;
  if (!globalAny.rateLimitCleanupInterval) {
    globalAny.rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      for (const [ip, record] of rateLimitMap.entries()) {
        record.timestamps = record.timestamps.filter((t) => now - t < oneHour);
        if (record.timestamps.length === 0) {
          rateLimitMap.delete(ip);
        }
      }
    }, 10 * 60 * 1000); // run every 10 minutes
  }
}

/**
 * Checks if a given IP has exceeded its allowed number of requests
 * within a sliding time window.
 */
export function isRateLimited(
  ip: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(ip, record);
  }

  // Remove timestamps outside of the sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    return true;
  }

  record.timestamps.push(now);
  return false;
}

/**
 * Extracts client IP safely from request headers.
 */
export function getClientIp(request: Request | NextRequest): string {
  // 1. Cloudflare connecting IP (most authoritative when proxied via Cloudflare)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  // 2. Real IP from reverse proxies (Nginx, Caddy, etc.)
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }

  // 3. True client IP header (Akamai, CloudFront, etc.)
  const trueClientIp = request.headers.get("true-client-ip");
  if (trueClientIp) {
    return trueClientIp.trim();
  }

  // 4. Standard X-Forwarded-For (client is the first IP in the comma-separated chain)
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0].trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // 5. NextRequest.ip property if present
  if ("ip" in request && typeof (request as any).ip === "string" && (request as any).ip) {
    return (request as any).ip;
  }

  return "127.0.0.1";
}
