import request from "supertest";
import { createApp } from "../app";
import { AppConfig } from "../config";

const testConfig: AppConfig = {
  port: 5001,
  allowedOrigins: ["http://allowed-frontend.com"],
  serverName: "Test Edge Server",
  maxTestDurationSeconds: 15,
  maxUploadBytes: 10485760,
};

describe("CORS Restrictions", () => {
  const app = createApp(testConfig);

  it("allows configured origin and sets CORS header", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://allowed-frontend.com");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://allowed-frontend.com",
    );
  });

  it("blocks unconfigured origin with HTTP 403 Forbidden", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://malicious-site.com");

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
    expect(res.body.message).toContain("CORS policy violation");
  });
});
