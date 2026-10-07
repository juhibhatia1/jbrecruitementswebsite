import { NextResponse } from "next/server";
import { detectCurrencyFromRequest } from "@/lib/geo-utils";
import { getClientIp } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const currency = await detectCurrencyFromRequest(request, clientIp);
  
  return NextResponse.json(
    { currency },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}

