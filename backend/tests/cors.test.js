const request = require("supertest");
const express = require("express");
const app = require("../src/app");

describe("CORS & Preflight Integration Tests", () => {
  it("should respond with CORS headers on OPTIONS preflight from allowed origin for /api/auth/login", async () => {
    const res = await request(app)
      .options("/api/auth/login")
      .set("Origin", "https://misc-eight-khaki.vercel.app")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type,Authorization");

    expect(res.headers["access-control-allow-origin"]).toBe("https://misc-eight-khaki.vercel.app");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.statusCode).toBe(204);
  });

  it("should respond with CORS headers on OPTIONS preflight for direct /auth/login", async () => {
    const res = await request(app)
      .options("/auth/login")
      .set("Origin", "https://misc-eight-khaki.vercel.app")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type,Authorization");

    expect(res.headers["access-control-allow-origin"]).toBe("https://misc-eight-khaki.vercel.app");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.statusCode).toBe(204);
  });

  it("should allow second test Vercel deployment on OPTIONS preflight", async () => {
    const res = await request(app)
      .options("/api/auth/login")
      .set("Origin", "https://misc-a4b7aix7s-muhammedansar-pvns-projects.vercel.app")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type,Authorization");

    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://misc-a4b7aix7s-muhammedansar-pvns-projects.vercel.app"
    );
    expect(res.statusCode).toBe(204);
  });

  it("should reject requests from unauthorized origins in production mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const res = await request(app)
      .options("/api/auth/login")
      .set("Origin", "https://evil-unauthorized-site.com")
      .set("Access-Control-Request-Method", "POST");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    process.env.NODE_ENV = originalEnv;
  });
});
