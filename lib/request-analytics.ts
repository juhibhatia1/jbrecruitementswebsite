import type { SubmissionRequestMeta } from "./submission-types";

function firstHeaderValue(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const first = value.split(",")[0]?.trim();
  return first || undefined;
}

function detectDeviceType(ua: string): SubmissionRequestMeta["deviceType"] {
  const normalized = ua.toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }

  if (
    /(mobi|android|iphone|ipod|blackberry|iemobile|opera mini)/i.test(
      normalized,
    )
  ) {
    return "mobile";
  }

  return "desktop";
}

function detectBrowser(ua: string): string | undefined {
  if (!ua) {
    return undefined;
  }

  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
  if (/chrome\//i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return "Safari";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/trident\//i.test(ua) || /msie/i.test(ua)) return "Internet Explorer";

  return "Other";
}

function detectOs(ua: string): string | undefined {
  if (!ua) {
    return undefined;
  }

  if (/windows nt/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/(iphone|ipad|ipod)/i.test(ua)) return "iOS";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";

  return "Other";
}

export function extractRequestMeta(request: Request): SubmissionRequestMeta {
  const headers = request.headers;

  const userAgent = headers.get("user-agent") || undefined;
  const ipAddress =
    firstHeaderValue(headers.get("x-forwarded-for")) ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    undefined;

  const sourcePath =
    headers.get("x-pathname") || headers.get("x-invoke-path") || undefined;

  return {
    sourcePath,
    referrer: headers.get("referer") || headers.get("referrer") || undefined,
    ipAddress,
    userAgent,
    browser: detectBrowser(userAgent || ""),
    os: detectOs(userAgent || ""),
    deviceType: detectDeviceType(userAgent || ""),
    country:
      headers.get("x-vercel-ip-country") ||
      headers.get("cf-ipcountry") ||
      undefined,
    region:
      headers.get("x-vercel-ip-country-region") ||
      headers.get("x-vercel-ip-region") ||
      undefined,
    city: headers.get("x-vercel-ip-city") || undefined,
  };
}
