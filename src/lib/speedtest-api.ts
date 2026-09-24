import {
  calculateMbps,
  calculateMeanPing,
  calculateJitter,
} from "./speed-calc";
import {
  validatePingResponse,
  validateDownloadResponse,
  validateUploadResponse,
} from "./api-validation";

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
 * Fetch helper with AbortController and configurable timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<Response> {
  const { timeoutMs = 10000, signal, ...fetchOpts } = options;

  if (signal?.aborted) {
    throw new DOMException("Speed test cancelled.", "AbortError");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(
      new DOMException(
        `Request timed out after ${timeoutMs}ms`,
        "TimeoutError",
      ),
    );
  }, timeoutMs);

  const onAbort = () => {
    controller.abort(
      signal?.reason || new DOMException("Speed test cancelled.", "AbortError"),
    );
  };

  if (signal) {
    signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      ...fetchOpts,
      signal: controller.signal,
    });
    return response;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      if (signal?.aborted) {
        throw new DOMException("Speed test cancelled.", "AbortError");
      }
      throw err;
    }
    if (typeof window !== "undefined" && !navigator.onLine) {
      throw new Error(
        "Network connection lost. Please check your internet connection.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onAbort);
    }
  }
}

/**
 * Helper to delay execution with cancellation support
 */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Speed test cancelled.", "AbortError"));
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Speed test cancelled.", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Runs mock test sequence when NEXT_PUBLIC_ENABLE_MOCK_MODE=true
 */
async function runMockTest(
  onProgress: ProgressCallback,
  signal?: AbortSignal,
): Promise<SpeedTestResult> {
  onProgress({ state: "preparing", currentSpeedMbps: 0, progressPercent: 5 });
  await delay(300, signal);

  onProgress({
    state: "testing-ping",
    currentSpeedMbps: 0,
    progressPercent: 15,
  });
  await delay(400, signal);

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

  let currentDownload = 0;
  const targetDownload = 85.4;
  for (let i = 1; i <= 10; i++) {
    await delay(100, signal);
    currentDownload = Number(((targetDownload * i) / 10).toFixed(2));
    onProgress({
      state: "testing-download",
      currentSpeedMbps: currentDownload,
      progressPercent: 25 + i * 3.5,
      pingMs,
      jitterMs,
      clientIp,
      ispName,
      serverLocation,
    });
  }

  const downloadMbps = targetDownload;

  let currentUpload = 0;
  const targetUpload = 42.1;
  for (let i = 1; i <= 10; i++) {
    await delay(100, signal);
    currentUpload = Number(((targetUpload * i) / 10).toFixed(2));
    onProgress({
      state: "testing-upload",
      currentSpeedMbps: currentUpload,
      progressPercent: 60 + i * 3.5,
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
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<SpeedTestResult> {
  const { signal, timeoutMs = 10000 } = options;

  if (isMockModeEnabled()) {
    return runMockTest(onProgress, signal);
  }

  const baseUrl = getApiBaseUrl();

  try {
    // Check network status
    if (typeof window !== "undefined" && !navigator.onLine) {
      throw new Error(
        "Network connection lost. Please check your internet connection.",
      );
    }

    // 1. Preparing
    onProgress({ state: "preparing", currentSpeedMbps: 0, progressPercent: 5 });

    // 2. Measure Ping & Jitter using multiple requests
    onProgress({
      state: "testing-ping",
      currentSpeedMbps: 0,
      progressPercent: 15,
    });

    const latencies: number[] = [];
    let serverLocation = "Unknown Server";
    let clientIp = "Unknown IP";
    let ispName = "Internet Service Provider";

    const PING_SAMPLES = 5;
    for (let i = 0; i < PING_SAMPLES; i++) {
      if (signal?.aborted) {
        throw new DOMException("Speed test cancelled.", "AbortError");
      }

      const pingStart = performance.now();
      const pingUrl = `${baseUrl}/speedtest/ping?t=${Date.now()}_${i}`;

      const res = await fetchWithTimeout(pingUrl, {
        signal,
        cache: "no-store",
        timeoutMs: Math.min(timeoutMs, 5000),
      }).catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw err;
        }
        throw new Error(
          `Ping request failed: ${
            err instanceof Error ? err.message : "Server unreachable"
          }`,
        );
      });

      if (!res.ok) {
        throw new Error(
          `Ping server returned HTTP status ${res.status}. Test aborted.`,
        );
      }

      let pingDataRaw: unknown;
      try {
        pingDataRaw = await res.json();
      } catch {
        throw new Error("Ping endpoint returned malformed non-JSON response.");
      }

      const pingData = validatePingResponse(pingDataRaw);
      const measuredRtt = Number((performance.now() - pingStart).toFixed(1));
      const samplePing =
        typeof pingData.latencyMs === "number"
          ? pingData.latencyMs
          : measuredRtt;

      latencies.push(samplePing);
      if (pingData.server) serverLocation = pingData.server;
      if (pingData.clientIp) clientIp = pingData.clientIp;
      if (pingData.isp) ispName = pingData.isp;

      onProgress({
        state: "testing-ping",
        currentSpeedMbps: 0,
        progressPercent: 15 + Math.floor(((i + 1) / PING_SAMPLES) * 10),
        clientIp,
        ispName,
        serverLocation,
      });
    }

    const pingMs = calculateMeanPing(latencies);
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
    const downloadUrl = `${baseUrl}/speedtest/download?duration=10&t=${Date.now()}`;

    const dlResponse = await fetchWithTimeout(downloadUrl, {
      signal,
      cache: "no-store",
      timeoutMs,
    }).catch((err) => {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      throw new Error(
        `Download request failed: ${
          err instanceof Error ? err.message : "Server unreachable"
        }`,
      );
    });

    if (!dlResponse.ok) {
      throw new Error(
        `Download server returned HTTP status ${dlResponse.status}. Test aborted.`,
      );
    }

    let downloadMbps = 0;
    const contentType = dlResponse.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      let dlDataRaw: unknown;
      try {
        dlDataRaw = await dlResponse.json();
      } catch {
        throw new Error("Download endpoint returned malformed JSON response.");
      }
      const validatedDl = validateDownloadResponse(dlDataRaw);
      downloadMbps = calculateMbps(validatedDl.bytes, validatedDl.durationMs);
      if (validatedDl.server) serverLocation = validatedDl.server;

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
    } else {
      // Handle streaming binary body
      if (!dlResponse.body) {
        throw new Error("No response body received from download endpoint.");
      }

      const reader = dlResponse.body.getReader();
      let downloadedBytes = 0;
      const totalExpectedBytes = parseInt(
        dlResponse.headers.get("Content-Length") || "10485760",
        10,
      );

      while (true) {
        if (signal?.aborted) {
          reader.cancel().catch(() => {});
          throw new DOMException("Speed test cancelled.", "AbortError");
        }

        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          downloadedBytes += value.byteLength;
          const elapsedSec = (performance.now() - downloadStart) / 1000;
          if (elapsedSec > 0) {
            const currentMbps = calculateMbps(
              downloadedBytes,
              elapsedSec * 1000,
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
      downloadMbps = calculateMbps(downloadedBytes, downloadDurationMs);
    }

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

    // Generate binary data payload (4MB)
    const uploadPayloadSize = 4 * 1024 * 1024;
    const uploadChunk = new Uint8Array(uploadPayloadSize);
    const uploadStart = performance.now();
    const uploadUrl = `${baseUrl}/speedtest/upload?t=${Date.now()}`;

    const ulResponse = await fetchWithTimeout(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: uploadChunk,
      cache: "no-store",
      signal,
      timeoutMs,
    }).catch((err) => {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      throw new Error(
        `Upload request failed: ${
          err instanceof Error ? err.message : "Server unreachable"
        }`,
      );
    });

    if (!ulResponse.ok) {
      throw new Error(
        `Upload server returned HTTP status ${ulResponse.status}. Test aborted.`,
      );
    }

    const uploadDurationMs = performance.now() - uploadStart;
    let uploadDataRaw: unknown;
    try {
      uploadDataRaw = await ulResponse.json();
    } catch {
      throw new Error("Upload endpoint returned malformed JSON response.");
    }

    const validatedUl = validateUploadResponse(uploadDataRaw);
    if (validatedUl.server) serverLocation = validatedUl.server;

    // Calculate upload speed using formula with exact transferred bytes and duration
    const uploadMbps = calculateMbps(
      validatedUl.bytes,
      validatedUl.durationMs || uploadDurationMs,
    );

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
    if (
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.message.includes("cancelled"))
    ) {
      onProgress({
        state: "idle",
        currentSpeedMbps: 0,
        progressPercent: 0,
        errorMessage: "Speed test was cancelled.",
      });
      throw error;
    }

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
