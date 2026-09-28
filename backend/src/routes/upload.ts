import { Router, Request, Response, NextFunction } from "express";
import { AppConfig } from "../config";
import { calculateMbps } from "../utils/speed-calc";

export function createUploadRouter(config: AppConfig): Router {
  const router = Router();

  router.post("/", (req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const contentLengthHeader = req.headers["content-length"];
    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (!isNaN(contentLength) && contentLength > config.maxUploadBytes) {
        return res.status(413).json({
          error: "Payload Too Large",
          message: `Upload payload size exceeds limit of ${config.maxUploadBytes} bytes.`,
          statusCode: 413,
        });
      }
    }

    const startTime = Date.now();
    let totalBytesReceived = 0;
    let isExceeded = false;

    req.on("data", (chunk: Buffer) => {
      if (isExceeded) return;

      totalBytesReceived += chunk.length;

      if (totalBytesReceived > config.maxUploadBytes) {
        isExceeded = true;
        req.pause();
        req.removeAllListeners("data");
        req.removeAllListeners("end");

        return res.status(413).json({
          error: "Payload Too Large",
          message: `Upload payload size exceeds limit of ${config.maxUploadBytes} bytes.`,
          statusCode: 413,
        });
      }
    });

    req.on("end", () => {
      if (isExceeded) return;

      const durationMs = Math.max(Date.now() - startTime, 1);
      const speedMbps = calculateMbps(totalBytesReceived, durationMs);

      return res.status(200).json({
        bytes: totalBytesReceived,
        durationMs,
        speedMbps,
        server: config.serverName,
      });
    });

    req.on("error", (err) => {
      if (!res.headersSent) {
        next(err);
      }
    });
  });

  return router;
}
