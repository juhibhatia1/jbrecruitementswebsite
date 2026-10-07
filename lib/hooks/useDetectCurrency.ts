"use client";

import { useState, useEffect } from "react";
import {
  detectCurrencyFromBrowser,
  getCachedCurrency,
  setCachedCurrency,
} from "@/lib/geo-utils";
import type { Currency } from "@/lib/rag/system-context";

const AED_COUNTRIES = new Set(["AE"]);
const INR_COUNTRIES = new Set(["IN"]);

/**
 * Detects the user's currency on the client side.
 *
 * Resolution order (each step short-circuits if it succeeds):
 *  1. sessionStorage cache — avoids repeat network calls across components
 *     and navigations within the same browser session.
 *  2. Browser timezone / locale heuristics (zero-latency, no network).
 *  3. `/api/geo` — Next.js edge route that reads Vercel/Cloudflare country
 *     headers; accurate on production with no external dependency.
 *  4. `ipapi.co` — external fallback for local dev / adblocker scenarios.
 *
 * Returns `null` while detection is in-flight (caller should show skeleton).
 * Returns a Currency string once resolved (falls back to "USD" if all methods fail).
 */
export function useDetectCurrency(): Currency | null {
  // Start as null — meaning "not yet resolved". Never default to USD on first render.
  const [currency, setCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    // Step 1: sessionStorage cache (avoids duplicate network calls within session)
    const cached = getCachedCurrency();
    if (cached) {
      setCurrency(cached);
      return;
    }

    // Step 2: Primary detection via server-side geo API (/api/geo reads edge headers: Vercel / Cloudflare)
    const geoController = new AbortController();
    const geoTimeout = setTimeout(() => geoController.abort(), 3500);

    fetch("/api/geo", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      signal: geoController.signal,
    })
      .then((r) => {
        clearTimeout(geoTimeout);
        if (!r.ok) throw new Error("Local geo API failed");
        return r.json();
      })
      .then((data: { currency?: string }) => {
        if (data.currency && ["USD", "AED", "INR"].includes(data.currency)) {
          const detected = data.currency as Currency;
          setCurrency(detected);
          setCachedCurrency(detected);
        } else {
          throw new Error("Invalid currency from /api/geo");
        }
      })
      .catch((err) => {
        clearTimeout(geoTimeout);
        console.warn(
          "[useDetectCurrency] /api/geo failed, attempting external IP lookup:",
          err,
        );

        // Step 3: External client IP lookup fallback (3.5s timeout)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        fetch("https://ipapi.co/json/", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data: { country_code?: string; error?: boolean }) => {
            if (data.error) throw new Error();
            const code = (data.country_code || "").toUpperCase().trim();
            let detected: Currency = "USD";
            if (AED_COUNTRIES.has(code)) detected = "AED";
            else if (INR_COUNTRIES.has(code)) detected = "INR";
            setCurrency(detected);
            setCachedCurrency(detected);
          })
          .catch(() => {
            // Step 4: Browser timezone fallback (offline or network blocked)
            const browserCurrency = detectCurrencyFromBrowser();
            setCurrency(browserCurrency);
            setCachedCurrency(browserCurrency);
          })
          .finally(() => clearTimeout(timeout));
      });
  }, []); // runs once per mount; cache prevents extra network calls

  return currency;
}
