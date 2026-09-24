/**
 * Speed and Latency Calculation Utilities
 */

/**
 * Calculates speed in Megabits per second (Mbps).
 * @param bytesTransferred Total bytes sent or received
 * @param durationMs Time taken in milliseconds
 * @returns Mbps rounded to 2 decimal places
 */
export function calculateMbps(
  bytesTransferred: number,
  durationMs: number,
): number {
  if (durationMs <= 0 || bytesTransferred <= 0) return 0;
  const bitsTransferred = bytesTransferred * 8;
  const seconds = durationMs / 1000;
  const bps = bitsTransferred / seconds;
  const mbps = bps / 1_000_000;
  return Number(mbps.toFixed(2));
}

/**
 * Calculates mean latency (Ping) in milliseconds.
 * @param latencies Array of latency values in ms
 * @returns Average ping rounded to 1 decimal place
 */
export function calculateMeanPing(latencies: number[]): number {
  if (!latencies || latencies.length === 0) return 0;
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  return Number((sum / latencies.length).toFixed(1));
}

/**
 * Calculates Jitter (mean difference between consecutive latency measurements) in milliseconds.
 * @param latencies Array of latency measurements in ms
 * @returns Jitter in ms rounded to 1 decimal place
 */
export function calculateJitter(latencies: number[]): number {
  if (!latencies || latencies.length < 2) return 0;
  let diffSum = 0;
  for (let i = 1; i < latencies.length; i++) {
    diffSum += Math.abs(latencies[i] - latencies[i - 1]);
  }
  const jitter = diffSum / (latencies.length - 1);
  return Number(jitter.toFixed(1));
}

/**
 * Formats speed values nicely for display
 */
export function formatSpeed(value: number): string {
  if (isNaN(value) || value < 0) return "0.00";
  return value.toFixed(2);
}
