import request from "supertest";
import { createApp } from "../app";
import { AppConfig } from "../config";

const testConfig: AppConfig = {
  port: 5001,
  allowedOrigins: ["http://localhost:3000"],
  serverName: "Test Edge Server",
  maxTestDurationSeconds: 10,
  maxUploadBytes: 10485760,
};

describe("GET /speedtest/download Endpoint", () => {
  const app = createApp(testConfig);

  it("rejects abusive duration values <= 0 with HTTP 400", async () => {
    const res = await request(app).get("/speedtest/download?duration=-5");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Bad Request");
    expect(res.body.message).toContain("Must be a positive number");
  });

  it("rejects non-numeric duration values with HTTP 400", async () => {
    const res = await request(app).get("/speedtest/download?duration=abc");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Bad Request");
  });

  it("rejects duration exceeding maxTestDurationSeconds with HTTP 400", async () => {
    const res = await request(app).get("/speedtest/download?duration=999");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Bad Request");
    expect(res.body.message).toContain("not exceeding 10 seconds");
  });

  it("returns JSON format when requested via query format=json", async () => {
    const res = await request(app).get(
      "/speedtest/download?duration=2&format=json",
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bytes");
    expect(res.body).toHaveProperty("durationMs", 2000);
    expect(res.body).toHaveProperty("speedMbps");
    expect(res.body).toHaveProperty("server", "Test Edge Server");
    expect(res.headers["cache-control"]).toContain("no-store");
  });

  it("streams binary octet-stream chunks and prevents caching", async () => {
    const res = await request(app)
      .get("/speedtest/download?duration=0.1")
      .buffer(true);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/octet-stream");
    expect(res.headers["cache-control"]).toContain("no-store");
    expect(res.body.length).toBeGreaterThan(0);
  });
});
