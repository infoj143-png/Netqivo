import { Router, Request, Response } from "express";
import { AppConfig } from "../config";

export function createPingRouter(config: AppConfig): Router {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    const rawIp =
      (req.headers["x-forwarded-for"] as string) || req.ip || "127.0.0.1";
    const clientIp = rawIp.split(",")[0].trim();

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.status(200).json({
      latencyMs: 0,
      server: config.serverName,
      clientIp,
      isp: "Local SpeedTest Node",
    });
  });

  return router;
}
