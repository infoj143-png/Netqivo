import {
  calculateMbps,
  calculateMeanPing,
  calculateJitter,
  formatSpeed,
} from "@/lib/speed-calc";

describe("Speed Calculator Utilities", () => {
  describe("calculateMbps", () => {
    it("correctly calculates Mbps from bytes and duration", () => {
      // 10 MB = 10 * 1024 * 1024 bytes = 10,485,760 bytes
      // 10,485,760 bytes * 8 bits/byte = 83,886,080 bits
      // In 1 second (1000 ms), Mbps = 83,886,080 / 1,000,000 = 83.89 Mbps
      const bytes = 10 * 1024 * 1024;
      const durationMs = 1000;
      expect(calculateMbps(bytes, durationMs)).toBe(83.89);
    });

    it("returns 0 when duration or bytes is zero or negative", () => {
      expect(calculateMbps(0, 1000)).toBe(0);
      expect(calculateMbps(1000, 0)).toBe(0);
      expect(calculateMbps(-500, 1000)).toBe(0);
      expect(calculateMbps(1000, -200)).toBe(0);
    });
  });

  describe("calculateMeanPing", () => {
    it("calculates average ping accurately", () => {
      expect(calculateMeanPing([10, 20, 30])).toBe(20.0);
      expect(calculateMeanPing([15.5, 18.2, 22.1])).toBe(18.6);
    });

    it("returns 0 for empty array", () => {
      expect(calculateMeanPing([])).toBe(0);
    });
  });

  describe("calculateJitter", () => {
    it("calculates jitter as average absolute differences between consecutive latencies", () => {
      // Differences: |20 - 10| = 10, |15 - 20| = 5 -> sum = 15. Count of diffs = 2. Jitter = 15 / 2 = 7.5
      expect(calculateJitter([10, 20, 15])).toBe(7.5);
    });

    it("returns 0 when fewer than 2 latency samples exist", () => {
      expect(calculateJitter([])).toBe(0);
      expect(calculateJitter([15])).toBe(0);
    });
  });

  describe("formatSpeed", () => {
    it("formats number to 2 decimal places", () => {
      expect(formatSpeed(45.6789)).toBe("45.68");
      expect(formatSpeed(0)).toBe("0.00");
    });

    it("handles negative or NaN inputs", () => {
      expect(formatSpeed(-10)).toBe("0.00");
      expect(formatSpeed(NaN)).toBe("0.00");
    });
  });
});
