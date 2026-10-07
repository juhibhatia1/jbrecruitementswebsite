import { Currency } from "./rag/system-context";

const AED_COUNTRIES = new Set(["AE"]);
const INR_COUNTRIES = new Set(["IN"]);
const INR_TIMEZONES = new Set([
  "Asia/Kolkata",
  "Asia/Calcutta",
]);

/**
 * Checks whether an IP address is a local or private address.
 */
export function isPrivateOrLoopbackIp(ip: string): boolean {
  if (!ip) return true;
  const trimmed = ip.trim();
  return (
    trimmed === "127.0.0.1" ||
    trimmed === "::1" ||
    trimmed === "localhost" ||
    trimmed.startsWith("192.168.") ||
    trimmed.startsWith("10.") ||
    trimmed.startsWith("172.16.") ||
    trimmed.startsWith("172.17.") ||
    trimmed.startsWith("172.18.") ||
    trimmed.startsWith("172.19.") ||
    trimmed.startsWith("172.20.") ||
    trimmed.startsWith("172.21.") ||
    trimmed.startsWith("172.22.") ||
    trimmed.startsWith("172.23.") ||
    trimmed.startsWith("172.24.") ||
    trimmed.startsWith("172.25.") ||
    trimmed.startsWith("172.26.") ||
    trimmed.startsWith("172.27.") ||
    trimmed.startsWith("172.28.") ||
    trimmed.startsWith("172.29.") ||
    trimmed.startsWith("172.30.") ||
    trimmed.startsWith("172.31.")
  );
}

/**
 * Detects the correct currency (USD, AED, or INR) based on edge headers
 * (x-vercel-ip-country, cf-ipcountry) or falls back to public IP geolocation.
 *
 * NOTE: Server host timezone is NEVER evaluated for public client requests.
 */
export async function detectCurrencyFromRequest(
  request: Request,
  clientIp: string
): Promise<Currency> {
  // 1. Try Vercel, Cloudflare, or standard edge country headers first (zero-latency production detection)
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    request.headers.get("cloudfront-viewer-country") ||
    "";

  if (headerCountry) {
    const code = headerCountry.toUpperCase().trim();
    if (AED_COUNTRIES.has(code)) return "AED";
    if (INR_COUNTRIES.has(code)) return "INR";
    return "USD";
  }

  const isLocal = isPrivateOrLoopbackIp(clientIp);

  // 2. For non-edge requests with a public IP, query IP geolocation lookup services
  if (!isLocal) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
        headers: { "User-Agent": "jbrecruitments.com geo-lookup/1.0" },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const code = (geoData.country_code || "").toUpperCase().trim();
        if (code) {
          if (AED_COUNTRIES.has(code)) return "AED";
          if (INR_COUNTRIES.has(code)) return "INR";
          return "USD";
        }
      }
    } catch {
      // Secondary fallback for public IP lookup
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const altRes = await fetch(`https://ipwho.is/${clientIp}`, {
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (altRes.ok) {
          const altData = await altRes.json();
          const code = (altData.country_code || "").toUpperCase().trim();
          if (code) {
            if (AED_COUNTRIES.has(code)) return "AED";
            if (INR_COUNTRIES.has(code)) return "INR";
            return "USD";
          }
        }
      } catch {
        // Fall through to default
      }
    }
  }

  // 3. Timezone hints ONLY for local developer testing when loopback IP is detected
  if (isLocal) {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone && INR_TIMEZONES.has(timeZone)) return "INR";
      if (timeZone === "Asia/Dubai") return "AED";
    } catch {}
  }

  return "USD";
}

/**
 * Client-side browser fallback (checks timezone only; NEVER checks language locale).
 */
export function detectCurrencyFromBrowser(): Currency {
  if (typeof window === "undefined") return "USD";
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (INR_TIMEZONES.has(timeZone)) return "INR";
    if (timeZone === "Asia/Dubai") return "AED";
  } catch {}

  return "USD";
}

const STATE_KEY = "__jb_geo_v4";

export function getCachedCurrency(): Currency | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const decoded = atob(raw);
    const state = JSON.parse(decoded) as { c?: Currency; t?: number };
    // Validate currency value and 1-hour expiration
    if (state.c && (state.c === "USD" || state.c === "AED" || state.c === "INR")) {
      if (state.t && Date.now() - state.t < 60 * 60 * 1000) {
        return state.c;
      }
    }
    sessionStorage.removeItem(STATE_KEY);
    return null;
  } catch (e) {
    return null;
  }
}

export function setCachedCurrency(currency: Currency): void {
  if (typeof window === "undefined") return;
  try {
    const state = { c: currency, t: Date.now() };
    const raw = JSON.stringify(state);
    const encoded = btoa(raw);
    sessionStorage.setItem(STATE_KEY, encoded);
    // Prune legacy cache keys to prevent stale INR reads
    sessionStorage.removeItem("__jb_state");
    sessionStorage.removeItem("jb_currency_v3");
  } catch (e) {}
}

export function clearCachedCurrency(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem("__jb_state");
    sessionStorage.removeItem("jb_currency_v3");
  } catch (e) {}
}
