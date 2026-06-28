import { NextResponse } from "next/server";
import { detectCurrencyFromRequest } from "@/lib/geo-utils";
import { getClientIp } from "@/lib/rate-limiter";

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const currency = await detectCurrencyFromRequest(request, clientIp);
  
  return NextResponse.json(
    { currency },
    { headers: { "Cache-Control": "private, max-age=600" } }
  );
}
