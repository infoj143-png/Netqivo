import cors, { CorsOptions } from "cors";
import { AppConfig } from "../config";

export function createCorsMiddleware(config: AppConfig) {
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) {
        return callback(null, true);
      }

      if (
        config.allowedOrigins.includes("*") ||
        config.allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS policy violation: Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Cache-Control",
    ],
    credentials: true,
    maxAge: 86400, // Cache preflight response for 24 hours
  };

  return cors(corsOptions);
}
