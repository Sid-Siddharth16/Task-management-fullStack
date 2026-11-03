import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { API_NAME, API_PREFIX, API_VERSION } from "../src/constants.js";

// DB is never connected here; these cover HTTP wiring, response shapes and middleware
describe(`GET ${API_PREFIX}`, () => {
  it("returns API info wrapped in ApiResponse", async () => {
    const res = await request(app).get(API_PREFIX);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      success: true,
      message: "Welcome to the API",
      data: { name: API_NAME, version: API_VERSION, environment: "test" },
    });
    expect(Date.parse(res.body.data.timestamp)).not.toBeNaN();
  });

  it("sends security headers and rate-limit headers", async () => {
    const res = await request(app).get(API_PREFIX);

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["ratelimit-policy"]).toBeDefined();
  });

  it("allows the configured CORS origin with credentials", async () => {
    const res = await request(app)
      .get(API_PREFIX)
      .set("Origin", "http://localhost:5173");

    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("does not allow an unknown CORS origin", async () => {
    const res = await request(app)
      .get(API_PREFIX)
      .set("Origin", "https://evil.example.com");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe(`GET ${API_PREFIX}/health`, () => {
  it("returns 503 when the database is not connected", async () => {
    const res = await request(app).get(`${API_PREFIX}/health`);

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      success: false,
      message: "Database unavailable",
      data: { db: "disconnected" },
    });
  });
});

describe("unknown routes", () => {
  it("returns a 404 in the standard error shape", async () => {
    const res = await request(app).get(`${API_PREFIX}/does-not-exist`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: `Route not found: GET ${API_PREFIX}/does-not-exist`,
      errors: [],
    });
  });
});
