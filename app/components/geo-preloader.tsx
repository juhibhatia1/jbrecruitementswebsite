"use client";

/**
 * GeoPreloader — renders nothing, but fires currency geo-detection on every
 * page so the result is warm in sessionStorage before the user navigates to
 * /job-seekers. This prevents the USD flash caused by detecting currency only
 * after the ServicesSection mounts.
 */
import { useDetectCurrency } from "@/lib/hooks/useDetectCurrency";

export default function GeoPreloader() {
  useDetectCurrency(); // fire-and-forget; result is cached in sessionStorage
  return null;
}
