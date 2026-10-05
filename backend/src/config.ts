export interface AppConfig {
  port: number;
  allowedOrigins: string[];
  serverName: string;
  maxTestDurationSeconds: number;
  maxUploadBytes: number;
}

export function getConfig(): AppConfig {
  const port = parseInt(process.env.PORT || "5000", 10);
  const rawOrigins = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = rawOrigins
    ? rawOrigins
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o.length > 0)
    : [
        "https://netqivo.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ];

  const serverName = (process.env.SERVER_NAME || "SpeedTest Edge Node").trim();
  const maxTestDurationSeconds = Math.max(
    1,
    parseInt(process.env.MAX_TEST_DURATION_SECONDS || "30", 10) || 30,
  );
  const maxUploadBytes = Math.max(
    1024 * 1024,
    parseInt(process.env.MAX_UPLOAD_BYTES || "52428800", 10) || 52428800,
  );

  return {
    port: isNaN(port) ? 5000 : port,
    allowedOrigins,
    serverName,
    maxTestDurationSeconds,
    maxUploadBytes,
  };
}
