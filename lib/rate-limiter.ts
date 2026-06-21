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
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }

  return "127.0.0.1";
}
