import request from "supertest";
import { createApp } from "../app";
import { AppConfig } from "../config";

const testConfig: AppConfig = {
  port: 5001,
  allowedOrigins: ["http://localhost:3000"],
  serverName: "Test Edge Server",
  maxTestDurationSeconds: 15,
  maxUploadBytes: 10485760,
};

describe("GET /speedtest/ping Endpoint", () => {
  const app = createApp(testConfig);

  it("returns ping metrics and no-cache headers", async () => {
    const res = await request(app).get("/speedtest/ping");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("latencyMs");
    expect(res.body).toHaveProperty("server", "Test Edge Server");
    expect(res.body).toHaveProperty("clientIp");
    expect(res.body).toHaveProperty("isp");
    expect(res.headers["cache-control"]).toContain("no-store");
  });
});
