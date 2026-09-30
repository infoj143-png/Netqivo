import express, { Express } from "express";
import { AppConfig, getConfig } from "./config";
import { createSecurityMiddleware } from "./middleware/security";
import { createCorsMiddleware } from "./middleware/cors";
import { createRateLimiter } from "./middleware/rateLimit";
import { createHealthRouter } from "./routes/health";
import { createPingRouter } from "./routes/ping";
import { createDownloadRouter } from "./routes/download";
import { createUploadRouter } from "./routes/upload";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

export function createApp(customConfig?: AppConfig): Express {
  const config = customConfig || getConfig();
  const app = express();

  // Security headers
  app.use(createSecurityMiddleware());

  // CORS restriction
  app.use(createCorsMiddleware(config));

  // Rate limiting
  app.use(createRateLimiter());

  // Parse JSON and URL-encoded bodies for standard API routes (if needed)
  app.use(express.json({ limit: "1mb" }));

  // Routers
  app.use("/health", createHealthRouter(config));
  app.use("/speedtest/ping", createPingRouter(config));
  app.use("/speedtest/download", createDownloadRouter(config));
  app.use("/speedtest/upload", createUploadRouter(config));

  // Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
