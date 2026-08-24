"use client";

import { useState, useEffect } from "react";
import {
  detectCurrencyFromBrowser,
  getCachedCurrency,
  setCachedCurrency,
} from "@/lib/geo-utils";
import type { Currency } from "@/lib/rag/system-context";

const AED_COUNTRIES = new Set(["AE"]);
const INR_COUNTRIES = new Set(["IN", "PK", "LK"]);

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
 * Returns "USD" as a safe default if all detection methods fail.
 */
export function useDetectCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    // Step 1: sessionStorage cache (avoids duplicate network calls)
    const cached = getCachedCurrency();
    if (cached && ["AED", "INR"].includes(cached)) {
      setCurrency(cached);
      return;
    }

    // Step 2: browser timezone / locale heuristics (zero-latency)
    const browserCurrency = detectCurrencyFromBrowser();
    if (browserCurrency !== "USD") {
      setCurrency(browserCurrency);
      setCachedCurrency(browserCurrency);
      return;
    }

    // USD was previously confirmed by a geo-lookup — honour the cache
    if (cached === "USD") {
      setCurrency("USD");
      return;
    }

    // Step 3: server-side geo API (edge headers on Vercel/CF)
    fetch("/api/geo")
      .then((r) => {
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
        console.warn(
          "[useDetectCurrency] /api/geo failed, falling back to ipapi.co:",
          err,
        );

        // Step 4: external ipapi.co fallback (adblocker-sensitive, 5s timeout)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch("https://ipapi.co/json/", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data: { country_code?: string; error?: boolean }) => {
            if (data.error) throw new Error();
            const code = (data.country_code || "").toUpperCase();
            let detected: Currency = "USD";
            if (AED_COUNTRIES.has(code)) detected = "AED";
            else if (INR_COUNTRIES.has(code)) detected = "INR";
            setCurrency(detected);
            setCachedCurrency(detected);
          })
          .catch(() => {
            // All detection failed — stay on USD default
            setCurrency("USD");
          })
          .finally(() => clearTimeout(timeout));
      });
  }, []); // runs once per mount; cache prevents extra network calls

  return currency;
}
