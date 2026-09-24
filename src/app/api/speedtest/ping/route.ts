import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  return NextResponse.json(
    {
      timestamp: Date.now(),
      clientIp,
      isp: "Internet Service Provider",
      location: "Nearest Edge Server (Primary)",
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}
