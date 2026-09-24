import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Default size 10MB or custom size parameter (in MB, capped between 1MB and 50MB)
  const sizeMbParam = parseInt(searchParams.get("size") || "10", 10);
  const sizeMb = Math.min(
    Math.max(isNaN(sizeMbParam) ? 10 : sizeMbParam, 1),
    50,
  );
  const totalBytes = sizeMb * 1024 * 1024;

  // Create zero-filled buffer payload chunk
  const chunk = new Uint8Array(64 * 1024); // 64KB chunk
  let sentBytes = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (sentBytes >= totalBytes) {
        controller.close();
        return;
      }
      const remainingBytes = totalBytes - sentBytes;
      if (remainingBytes < chunk.length) {
        controller.enqueue(chunk.subarray(0, remainingBytes));
        sentBytes += remainingBytes;
      } else {
        controller.enqueue(chunk);
        sentBytes += chunk.length;
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": totalBytes.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
    },
  });
}
