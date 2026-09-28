export interface PingApiResponse {
  latencyMs: number;
  server: string;
  clientIp?: string;
  isp?: string;
}

export interface DownloadApiResponse {
  bytes: number;
  durationMs: number;
  speedMbps: number;
  server: string;
}

export interface UploadApiResponse {
  bytes: number;
  durationMs: number;
  speedMbps: number;
  server: string;
}

/**
 * Validates the API response from GET /speedtest/ping
 */
export function validatePingResponse(data: unknown): PingApiResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error(
      "Invalid API response: Expected JSON object for ping response.",
    );
  }

  const obj = data as Record<string, unknown>;

  if (
    typeof obj.latencyMs !== "number" ||
    isNaN(obj.latencyMs) ||
    obj.latencyMs < 0
  ) {
    throw new Error(
      "Invalid API response: 'latencyMs' must be a non-negative number.",
    );
  }

  if (typeof obj.server !== "string" || obj.server.trim().length === 0) {
    throw new Error(
      "Invalid API response: 'server' must be a non-empty string.",
    );
  }

  return {
    latencyMs: obj.latencyMs,
    server: obj.server,
    clientIp: typeof obj.clientIp === "string" ? obj.clientIp : undefined,
    isp: typeof obj.isp === "string" ? obj.isp : undefined,
  };
}

/**
 * Validates the API response from GET /speedtest/download
 */
export function validateDownloadResponse(data: unknown): DownloadApiResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error(
      "Invalid API response: Expected JSON object for download response.",
    );
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.bytes !== "number" || isNaN(obj.bytes) || obj.bytes <= 0) {
    throw new Error("Invalid API response: 'bytes' must be a positive number.");
  }

  if (
    typeof obj.durationMs !== "number" ||
    isNaN(obj.durationMs) ||
    obj.durationMs <= 0
  ) {
    throw new Error(
      "Invalid API response: 'durationMs' must be a positive number.",
    );
  }

  if (
    typeof obj.speedMbps !== "number" ||
    isNaN(obj.speedMbps) ||
    obj.speedMbps < 0
  ) {
    throw new Error(
      "Invalid API response: 'speedMbps' must be a non-negative number.",
    );
  }

  if (typeof obj.server !== "string" || obj.server.trim().length === 0) {
    throw new Error(
      "Invalid API response: 'server' must be a non-empty string.",
    );
  }

  return {
    bytes: obj.bytes,
    durationMs: obj.durationMs,
    speedMbps: obj.speedMbps,
    server: obj.server,
  };
}

/**
 * Validates the API response from POST /speedtest/upload
 */
export function validateUploadResponse(data: unknown): UploadApiResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error(
      "Invalid API response: Expected JSON object for upload response.",
    );
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.bytes !== "number" || isNaN(obj.bytes) || obj.bytes <= 0) {
    throw new Error("Invalid API response: 'bytes' must be a positive number.");
  }

  if (
    typeof obj.durationMs !== "number" ||
    isNaN(obj.durationMs) ||
    obj.durationMs <= 0
  ) {
    throw new Error(
      "Invalid API response: 'durationMs' must be a positive number.",
    );
  }

  if (
    typeof obj.speedMbps !== "number" ||
    isNaN(obj.speedMbps) ||
    obj.speedMbps < 0
  ) {
    throw new Error(
      "Invalid API response: 'speedMbps' must be a non-negative number.",
    );
  }

  if (typeof obj.server !== "string" || obj.server.trim().length === 0) {
    throw new Error(
      "Invalid API response: 'server' must be a non-empty string.",
    );
  }

  return {
    bytes: obj.bytes,
    durationMs: obj.durationMs,
    speedMbps: obj.speedMbps,
    server: obj.server,
  };
}
