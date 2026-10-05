import { createApp } from "./app";
import { getConfig } from "./config";

const config = getConfig();
const app = createApp(config);

const server = app.listen(config.port, () => {
  console.log(`[SpeedTest Backend] Server running on port ${config.port}`);
  console.log(`[SpeedTest Backend] Server Name: ${config.serverName}`);
  console.log(
    `[SpeedTest Backend] Allowed Origins: ${config.allowedOrigins.join(", ")}`,
  );
});

// Configure safe HTTP server timeouts suitable for speed tests while avoiding hanging connections:
// - requestTimeout: Allows active download/upload test streams up to maxTestDurationSeconds plus buffer (60s).
// - keepAliveTimeout: Exceeds standard reverse proxy (Render/Nginx) 60s idle timeout to prevent TCP socket races (65s).
// - headersTimeout: Must exceed keepAliveTimeout in Node.js (66s) to ensure socket timeouts run sequentially without runtime errors.
server.requestTimeout = Math.max((config.maxTestDurationSeconds + 30) * 1000, 60000);
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(
    `[SpeedTest Backend] ${signal} signal received: closing HTTP server`,
  );
  server.close(() => {
    console.log("[SpeedTest Backend] HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
