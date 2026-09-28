import request from "supertest";
import { createApp } from "../app";
import { AppConfig } from "../config";

const testConfig: AppConfig = {
  port: 5001,
  allowedOrigins: ["http://localhost:3000"],
  serverName: "Test Edge Server",
  maxTestDurationSeconds: 15,
  maxUploadBytes: 1024 * 1024, // 1MB limit for testing
};

describe("POST /speedtest/upload Endpoint", () => {
  const app = createApp(testConfig);

  it("consumes uploaded buffer safely and returns byte count and speed metrics", async () => {
    const bufferSize = 256 * 1024; // 256KB
    const payload = Buffer.alloc(bufferSize, "a");

    const res = await request(app)
      .post("/speedtest/upload")
      .set("Content-Type", "application/octet-stream")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bytes", bufferSize);
    expect(res.body).toHaveProperty("durationMs");
    expect(typeof res.body.durationMs).toBe("number");
    expect(res.body).toHaveProperty("speedMbps");
    expect(res.body).toHaveProperty("server", "Test Edge Server");
    expect(res.headers["cache-control"]).toContain("no-store");
  });

  it("rejects uploads exceeding MAX_UPLOAD_BYTES via Content-Length header with HTTP 413", async () => {
    const oversizedLength = testConfig.maxUploadBytes + 100;

    const res = await request(app)
      .post("/speedtest/upload")
      .set("Content-Type", "application/octet-stream")
      .set("Content-Length", oversizedLength.toString())
      .send(Buffer.alloc(10));

    expect(res.status).toBe(413);
    expect(res.body).toHaveProperty("error", "Payload Too Large");
  });
});
