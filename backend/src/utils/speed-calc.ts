export function calculateMbps(bytes: number, durationMs: number): number {
  if (bytes <= 0 || durationMs <= 0) return 0;
  const bits = bytes * 8;
  const durationSeconds = durationMs / 1000;
  const mbps = bits / durationSeconds / 1000000;
  return Number(mbps.toFixed(2));
}
