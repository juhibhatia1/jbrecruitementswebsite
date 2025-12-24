"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "../lib/analytics";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      pageview(pathname + searchParams.toString());
    }
  }, [pathname, searchParams]);

  return null;
}
