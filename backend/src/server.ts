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
