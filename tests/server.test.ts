import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("POST /api/analyze", () => {
  it("should return 400 if text is missing", async () => {
    const response = await request(app)
      .post("/api/analyze")
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return mocked successful analysis data", async () => {
    const response = await request(app)
      .post("/api/analyze")
      .send({ text: "This is a radical and disastrous scheme!" });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("findings");
    expect(response.body).toHaveProperty("summary");
    expect(response.body).toHaveProperty("objectivityScore", 40);
  });
});
