import { Router, Request, Response } from "express";
import { AppConfig } from "../config";

export function createHealthRouter(config: AppConfig): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      server: config.serverName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return router;
}
