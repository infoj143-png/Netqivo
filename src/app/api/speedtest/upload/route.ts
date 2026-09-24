import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const startTime = Date.now();
  let bytesReceived = 0;

  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        bytesReceived += value.byteLength;
      }
    }
  } else {
    const arrayBuffer = await request.arrayBuffer();
    bytesReceived = arrayBuffer.byteLength;
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      bytesReceived,
      durationMs,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}
