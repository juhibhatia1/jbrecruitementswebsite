"use client";

import { useState, useEffect, useCallback } from "react";

export function useLinkedInFollowers() {
  const [followers, setFollowers] = useState<number>(401049);
  const [formatted, setFormatted] = useState<string>("401,049");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchFollowers = useCallback(async () => {
    try {
      const res = await fetch("/api/linkedin/followers", {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.followers && typeof data.followers === "number") {
          setFollowers(data.followers);
          setFormatted(data.formatted || `${data.followers.toLocaleString("en-US")}+`);
          setIsLive(true);
          setLastUpdated(data.lastUpdated || new Date().toISOString());
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.warn("Could not load real-time LinkedIn followers:", err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowers();

    // Poll every 30 seconds for real-time synchronization
    const interval = setInterval(fetchFollowers, 30000);

    // Refresh immediately when tab gains focus
    const handleFocus = () => {
      fetchFollowers();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchFollowers]);

  return { followers, formatted, isLoading, isLive, lastUpdated, refetch: fetchFollowers };
}
