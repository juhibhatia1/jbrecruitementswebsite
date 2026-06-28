import { Currency } from "./rag/system-context";

const AED_COUNTRIES = new Set(["AE"]);
const INR_COUNTRIES = new Set(["IN", "PK", "LK"]);

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
    }
  } catch (err) {
    console.error("[geo-utils] Geo-detection fallback error:", err);
  }

  return "USD";
}
