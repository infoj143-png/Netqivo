import { runSpeedTest, fetchWithTimeout } from "@/lib/speedtest-api";
import {
  validatePingResponse,
  validateDownloadResponse,
  validateUploadResponse,
} from "@/lib/api-validation";

const originalFetch = global.fetch;

describe("SpeedTest API Client & Response Validation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("API Response Validators", () => {
    describe("validatePingResponse", () => {
      it("validates valid ping response", () => {
        const valid = { latencyMs: 42, server: "Lahore" };
        expect(validatePingResponse(valid)).toEqual({
          latencyMs: 42,
          server: "Lahore",
          clientIp: undefined,
          isp: undefined,
        });
      });

      it("throws error for non-object responses", () => {
        expect(() => validatePingResponse(null)).toThrow(
          "Invalid API response: Expected JSON object for ping response.",
        );
        expect(() => validatePingResponse("invalid")).toThrow(
          "Invalid API response: Expected JSON object for ping response.",
        );
      });

      it("throws error for missing or negative latencyMs", () => {
        expect(() => validatePingResponse({ server: "Lahore" })).toThrow(
          "Invalid API response: 'latencyMs' must be a non-negative number.",
        );
        expect(() =>
          validatePingResponse({ latencyMs: -10, server: "Lahore" }),
        ).toThrow(
          "Invalid API response: 'latencyMs' must be a non-negative number.",
        );
        expect(() =>
          validatePingResponse({ latencyMs: "42", server: "Lahore" }),
        ).toThrow(
          "Invalid API response: 'latencyMs' must be a non-negative number.",
        );
      });

      it("throws error for missing or empty server string", () => {
        expect(() =>
          validatePingResponse({ latencyMs: 42, server: "" }),
        ).toThrow("Invalid API response: 'server' must be a non-empty string.");
        expect(() => validatePingResponse({ latencyMs: 42 })).toThrow(
          "Invalid API response: 'server' must be a non-empty string.",
        );
      });
    });

    describe("validateDownloadResponse", () => {
      it("validates valid download response", () => {
        const valid = {
          bytes: 123456789,
          durationMs: 10000,
          speedMbps: 98.77,
          server: "Lahore",
        };
        expect(validateDownloadResponse(valid)).toEqual(valid);
      });

      it("throws error for invalid or non-positive bytes / durationMs", () => {
        expect(() =>
          validateDownloadResponse({
            bytes: 0,
            durationMs: 10000,
            speedMbps: 98.77,
            server: "Lahore",
          }),
        ).toThrow("Invalid API response: 'bytes' must be a positive number.");

        expect(() =>
          validateDownloadResponse({
            bytes: 123456789,
            durationMs: -5,
            speedMbps: 98.77,
            server: "Lahore",
          }),
        ).toThrow(
          "Invalid API response: 'durationMs' must be a positive number.",
        );
      });
    });

    describe("validateUploadResponse", () => {
      it("validates valid upload response", () => {
        const valid = {
          bytes: 12345678,
          durationMs: 10000,
          speedMbps: 9.88,
          server: "Lahore",
        };
        expect(validateUploadResponse(valid)).toEqual(valid);
      });

      it("throws error for missing fields or bad types", () => {
        expect(() => validateUploadResponse({ bytes: 1000 })).toThrow(
          "Invalid API response: 'durationMs' must be a positive number.",
        );
      });
    });
  });

  describe("Timeout and Abort handling", () => {
    it("handles request timeout properly", async () => {
      global.fetch = jest.fn(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            if (options?.signal) {
              options.signal.addEventListener("abort", () => {
                reject(
                  options.signal.reason ||
                    new DOMException("Aborted", "AbortError"),
                );
              });
            }
          }),
      ) as unknown as typeof fetch;

      await expect(
        fetchWithTimeout("https://example.com/api", { timeoutMs: 50 }),
      ).rejects.toThrow(/timed out/i);
    });

    it("handles user cancellation signal", async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(
        fetchWithTimeout("https://example.com/api", {
          signal: controller.signal,
        }),
      ).rejects.toThrow("Speed test cancelled.");
    });
  });

  describe("runSpeedTest against real API endpoints", () => {
    it("completes speed test flow successfully with valid API responses", async () => {
      global.fetch = jest.fn((url: string) => {
        if (url.includes("/speedtest/ping")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                latencyMs: 42,
                server: "Lahore",
                clientIp: "203.0.113.1",
                isp: "Test ISP",
              }),
          });
        }
        if (url.includes("/speedtest/download")) {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ "Content-Type": "application/json" }),
            json: () =>
              Promise.resolve({
                bytes: 123456789,
                durationMs: 10000,
                speedMbps: 98.77,
                server: "Lahore",
              }),
          });
        }
        if (url.includes("/speedtest/upload")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                bytes: 12345678,
                durationMs: 10000,
                speedMbps: 9.88,
                server: "Lahore",
              }),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      }) as unknown as typeof fetch;

      const progressEvents: string[] = [];
      const result = await runSpeedTest((p) => {
        progressEvents.push(p.state);
      });

      expect(progressEvents).toContain("preparing");
      expect(progressEvents).toContain("testing-ping");
      expect(progressEvents).toContain("testing-download");
      expect(progressEvents).toContain("testing-upload");
      expect(progressEvents).toContain("completed");

      expect(result.pingMs).toBe(42);
      expect(result.downloadMbps).toBe(98.77);
      expect(result.uploadMbps).toBe(9.88);
      expect(result.serverLocation).toBe("Lahore");
    });

    it("throws error and reports error state on malformed API response", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invalid: "response" }),
        }),
      ) as unknown as typeof fetch;

      const progressEvents: string[] = [];
      await expect(
        runSpeedTest((p) => {
          progressEvents.push(p.state);
        }),
      ).rejects.toThrow(/Invalid API response/);

      expect(progressEvents).toContain("error");
    });

    it("throws error and reports error state on HTTP status 500", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        }),
      ) as unknown as typeof fetch;

      const progressEvents: string[] = [];
      await expect(
        runSpeedTest((p) => {
          progressEvents.push(p.state);
        }),
      ).rejects.toThrow(/returned HTTP status 500/);

      expect(progressEvents).toContain("error");
    });
  });
});
