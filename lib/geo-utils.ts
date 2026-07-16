import { Currency } from "./rag/system-context";

const AED_COUNTRIES = new Set(["AE"]);
const INR_COUNTRIES = new Set(["IN", "PK", "LK"]);
const INR_TIMEZONES = new Set([
  "Asia/Kolkata",
  "Asia/Calcutta",
  "Asia/Colombo",
  "Asia/Karachi",
]);

/**
 * Detects the correct currency (USD, AED, or INR) based on headers (x-vercel-ip-country, cf-ipcountry)
 * or falls back to server-side IP geolocation (via ipapi.co) for local development/non-Vercel envs.
 */
export async function detectCurrencyFromRequest(
  request: Request,
  clientIp: string
): Promise<Currency> {
  // 1. Try Vercel or Cloudflare country headers first (zero-latency production detection)
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "";

  if (headerCountry) {
    const code = headerCountry.toUpperCase();
    if (AED_COUNTRIES.has(code)) return "AED";
    if (INR_COUNTRIES.has(code)) return "INR";
    return "USD";
  }

  // 1b. Timezone hints help on localhost / proxies where country headers are absent.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone && INR_TIMEZONES.has(timeZone)) {
    return "INR";
  }

  // 2. Fallback to ipapi.co lookup (essential for local development npm run dev)
  try {
    const geoUrl = clientIp
      ? `https://ipapi.co/${clientIp}/json/`
      : "https://ipapi.co/json/";

    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "jbrecruitments.com geo-lookup/1.0" },
      next: { revalidate: 600 }
    });

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const code = (geoData.country_code || "").toUpperCase();
      if (AED_COUNTRIES.has(code)) return "AED";
      if (INR_COUNTRIES.has(code)) return "INR";
      const geoTimeZone = String(geoData.timezone || "");
      if (INR_TIMEZONES.has(geoTimeZone)) return "INR";
    }
  } catch (err) {
    console.error("[geo-utils] Geo-detection fallback error:", err);
  }

  return "USD";
}

export function detectCurrencyFromBrowser(): Currency {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (INR_TIMEZONES.has(timeZone)) return "INR";

  const language = (typeof navigator !== "undefined" && navigator.language ? navigator.language : "").toLowerCase();
  if (language.startsWith("en-in") || language.startsWith("hi-in") || language.startsWith("mr-in")) {
    return "INR";
  }

  return "USD";
}
