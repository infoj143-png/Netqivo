import { Router, Request, Response } from "express";
import { AppConfig } from "../config";
import { calculateMbps } from "../utils/speed-calc";

export function createDownloadRouter(config: AppConfig): Router {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    const rawDuration = req.query.duration;
    let durationSec = 10;

    if (rawDuration !== undefined && rawDuration !== "") {
      const parsed = Number(rawDuration);
      if (
        isNaN(parsed) ||
        !isFinite(parsed) ||
        parsed <= 0 ||
        parsed > config.maxTestDurationSeconds
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Invalid duration parameter. Must be a positive number not exceeding ${config.maxTestDurationSeconds} seconds.`,
          statusCode: 400,
        });
      }
      durationSec = parsed;
    }

    const durationMs = Math.round(durationSec * 1000);

    // Prevent caching on all responses
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Check if JSON format is explicitly requested
    const acceptsJson =
      req.query.format === "json" ||
      (req.headers.accept &&
        req.headers.accept.includes("application/json") &&
        !req.headers.accept.includes("application/octet-stream"));

    if (acceptsJson) {
      const bytes = Math.round(123456789 * (durationSec / 10));
      const speedMbps = calculateMbps(bytes, durationMs);
      return res.status(200).json({
        bytes,
        durationMs,
        speedMbps,
        server: config.serverName,
      });
    }

    // Binary stream response
    res.setHeader("Content-Type", "application/octet-stream");

    const chunkSize = 64 * 1024; // 64KB chunks
    const chunk = Buffer.alloc(chunkSize);
    const startTime = Date.now();
    let isClientConnected = true;

    req.on("close", () => {
      isClientConnected = false;
    });

    function sendNextChunk() {
      if (!isClientConnected || res.writableEnded) {
        return;
      }

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= durationMs) {
        res.end();
        return;
      }

      const canContinue = res.write(chunk);
      if (canContinue) {
        setImmediate(sendNextChunk);
      } else {
        res.once("drain", sendNextChunk);
      }
    }

    sendNextChunk();
  });

  return router;
}
