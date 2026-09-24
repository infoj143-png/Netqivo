import {
  calculateMbps,
  calculateMeanPing,
  calculateJitter,
} from "./speed-calc";

export type TestState =
  | "idle"
  | "preparing"
  | "testing-ping"
  | "testing-download"
  | "testing-upload"
  | "completed"
  | "error";

export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  clientIp: string;
  ispName: string;
  serverLocation: string;
  timestamp: number;
}

export interface SpeedTestProgress {
  state: TestState;
  currentSpeedMbps: number;
  progressPercent: number; // 0 to 100
  pingMs?: number;
  jitterMs?: number;
  downloadMbps?: number;
  uploadMbps?: number;
  clientIp?: string;
  ispName?: string;
  serverLocation?: string;
  errorMessage?: string;
}

export type ProgressCallback = (progress: SpeedTestProgress) => void;

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SPEEDTEST_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "";
}

export function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MOCK_MODE === "true";
}

/**
 * Runs mock test sequence for development/testing environments when NEXT_PUBLIC_ENABLE_MOCK_MODE=true
 */
async function runMockTest(
  onProgress: ProgressCallback,
): Promise<SpeedTestResult> {
  // Step 1: Preparing
  onProgress({ state: "preparing", currentSpeedMbps: 0, progressPercent: 5 });
  await new Promise((r) => setTimeout(r, 400));

  // Step 2: Testing Ping
  onProgress({
    state: "testing-ping",
    currentSpeedMbps: 0,
    progressPercent: 15,
  });
  await new Promise((r) => setTimeout(r, 600));

  const pingMs = 18.5;
  const jitterMs = 2.4;
  const clientIp = "203.0.113.42 (Mock)";
  const ispName = "Dev Mock ISP";
  const serverLocation = "Local Development Node";

  onProgress({
    state: "testing-ping",
    currentSpeedMbps: 0,
    progressPercent: 25,
    pingMs,
    jitterMs,
    clientIp,
    ispName,
    serverLocation,
  });

  // Step 3: Testing Download
  let currentDownload = 0;
  const targetDownload = 85.4;
  for (let i = 1; i <= 10; i++) {
    await new Promise((r) => setTimeout(r, 120));
    currentDownload = Number(((targetDownload * i) / 10).toFixed(2));
    onProgress({
      state: "testing-download",
      currentSpeedMbps: currentDownload,
      progressPercent: 25 + i * 3.5, // up to 60%
      pingMs,
      jitterMs,
      clientIp,
      ispName,
      serverLocation,
    });
  }

  const downloadMbps = targetDownload;

  // Step 4: Testing Upload
  let currentUpload = 0;
  const targetUpload = 42.1;
  for (let i = 1; i <= 10; i++) {
    await new Promise((r) => setTimeout(r, 120));
    currentUpload = Number(((targetUpload * i) / 10).toFixed(2));
    onProgress({
      state: "testing-upload",
      currentSpeedMbps: currentUpload,
      progressPercent: 60 + i * 3.5, // up to 95%
      pingMs,
      jitterMs,
      downloadMbps,
      clientIp,
      ispName,
      serverLocation,
    });
  }

  const uploadMbps = targetUpload;

  const result: SpeedTestResult = {
    downloadMbps,
    uploadMbps,
    pingMs,
    jitterMs,
    clientIp,
    ispName,
    serverLocation,
    timestamp: Date.now(),
  };

  onProgress({
    state: "completed",
    currentSpeedMbps: downloadMbps,
    progressPercent: 100,
    pingMs,
    jitterMs,
    downloadMbps,
    uploadMbps,
    clientIp,
    ispName,
    serverLocation,
  });

  return result;
}

/**
 * Runs full internet speed test against real backend
 */
export async function runSpeedTest(
  onProgress: ProgressCallback,
): Promise<SpeedTestResult> {
  if (isMockModeEnabled()) {
    return runMockTest(onProgress);
  }

  const baseUrl = getApiBaseUrl();

  try {
    // 1. Preparing & Fetch Ping Info
    onProgress({ state: "preparing", currentSpeedMbps: 0, progressPercent: 5 });

    const pingStart = Date.now();
    const pingRes = await fetch(`${baseUrl}/api/speedtest/ping`, {
      cache: "no-store",
    }).catch(() => {
      throw new Error(
        "Speed test server is unreachable. Please check your network or try again later.",
      );
    });

    if (!pingRes.ok) {
      throw new Error(
        `Ping server returned status ${pingRes.status}. Test aborted.`,
      );
    }

    const pingData = await pingRes.json();
    const clientIp = pingData.clientIp || "Unknown IP";
    const ispName = pingData.isp || "Internet Service Provider";
    const serverLocation = pingData.location || "Primary Test Server";

    // 2. Measure Ping & Jitter
    onProgress({
      state: "testing-ping",
      currentSpeedMbps: 0,
      progressPercent: 15,
      clientIp,
      ispName,
      serverLocation,
    });

    const latencies: number[] = [];
    for (let i = 0; i < 5; i++) {
      const pStart = performance.now();
      const res = await fetch(
        `${baseUrl}/api/speedtest/ping?t=${Date.now()}_${i}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        latencies.push(performance.now() - pStart);
      }
      onProgress({
        state: "testing-ping",
        currentSpeedMbps: 0,
        progressPercent: 15 + (i + 1) * 2,
        clientIp,
        ispName,
        serverLocation,
      });
    }

    const pingMs =
      calculateMeanPing(latencies) ||
      Number((Date.now() - pingStart).toFixed(1));
    const jitterMs = calculateJitter(latencies);

    onProgress({
      state: "testing-ping",
      currentSpeedMbps: 0,
      progressPercent: 25,
      pingMs,
      jitterMs,
      clientIp,
      ispName,
      serverLocation,
    });

    // 3. Test Download Speed
    onProgress({
      state: "testing-download",
      currentSpeedMbps: 0,
      progressPercent: 30,
      pingMs,
      jitterMs,
      clientIp,
      ispName,
      serverLocation,
    });

    const downloadStart = performance.now();
    const dlResponse = await fetch(
      `${baseUrl}/api/speedtest/download?size=10&t=${Date.now()}`,
      { cache: "no-store" },
    );

    if (!dlResponse.ok || !dlResponse.body) {
      throw new Error("Failed to download payload from speed test server.");
    }

    const reader = dlResponse.body.getReader();
    let downloadedBytes = 0;
    const totalExpectedBytes = parseInt(
      dlResponse.headers.get("Content-Length") || "10485760",
      10,
    );

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        downloadedBytes += value.byteLength;
        const elapsedSec = (performance.now() - downloadStart) / 1000;
        if (elapsedSec > 0) {
          const currentMbps = Number(
            ((downloadedBytes * 8) / (elapsedSec * 1_000_000)).toFixed(2),
          );
          const dlPercent =
            30 +
            Math.min(
              30,
              Math.floor((downloadedBytes / totalExpectedBytes) * 30),
            );
          onProgress({
            state: "testing-download",
            currentSpeedMbps: currentMbps,
            progressPercent: dlPercent,
            pingMs,
            jitterMs,
            clientIp,
            ispName,
            serverLocation,
          });
        }
      }
    }

    const downloadDurationMs = performance.now() - downloadStart;
    const downloadMbps = calculateMbps(downloadedBytes, downloadDurationMs);

    onProgress({
      state: "testing-download",
      currentSpeedMbps: downloadMbps,
      progressPercent: 60,
      pingMs,
      jitterMs,
      downloadMbps,
      clientIp,
      ispName,
      serverLocation,
    });

    // 4. Test Upload Speed
    onProgress({
      state: "testing-upload",
      currentSpeedMbps: 0,
      progressPercent: 65,
      pingMs,
      jitterMs,
      downloadMbps,
      clientIp,
      ispName,
      serverLocation,
    });

    // Send 4MB chunk for upload test
    const uploadPayloadSize = 4 * 1024 * 1024;
    const uploadChunk = new Uint8Array(uploadPayloadSize);

    const uploadStart = performance.now();

    const ulResponse = await fetch(
      `${baseUrl}/api/speedtest/upload?t=${Date.now()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: uploadChunk,
        cache: "no-store",
      },
    );

    if (!ulResponse.ok) {
      throw new Error("Failed to post upload payload to speed test server.");
    }

    const uploadDurationMs = performance.now() - uploadStart;
    const uploadMbps = calculateMbps(uploadPayloadSize, uploadDurationMs);

    onProgress({
      state: "testing-upload",
      currentSpeedMbps: uploadMbps,
      progressPercent: 95,
      pingMs,
      jitterMs,
      downloadMbps,
      uploadMbps,
      clientIp,
      ispName,
      serverLocation,
    });

    const finalResult: SpeedTestResult = {
      downloadMbps,
      uploadMbps,
      pingMs,
      jitterMs,
      clientIp,
      ispName,
      serverLocation,
      timestamp: Date.now(),
    };

    onProgress({
      state: "completed",
      currentSpeedMbps: downloadMbps,
      progressPercent: 100,
      pingMs,
      jitterMs,
      downloadMbps,
      uploadMbps,
      clientIp,
      ispName,
      serverLocation,
    });

    return finalResult;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during the speed test.";
    onProgress({
      state: "error",
      currentSpeedMbps: 0,
      progressPercent: 0,
      errorMessage,
    });
    throw new Error(errorMessage);
  }
}
