import { NextResponse } from "next/server";
import { calculateMbps } from "@/lib/speed-calc";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const durationSec = parseInt(searchParams.get("duration") || "10", 10);
  const durationMs = Math.max(isNaN(durationSec) ? 10 : durationSec, 1) * 1000;

  const bytes = 123456789;
  const speedMbps = calculateMbps(bytes, durationMs);

  return NextResponse.json(
    {
      bytes,
      durationMs,
      speedMbps,
      server: "Lahore",
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}
