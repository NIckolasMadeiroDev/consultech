import { describe, it, expect } from "vitest";
import { apiHandler } from "@/lib/api-handler";
import { ZodError } from "zod";

describe("apiHandler", () => {
  it("retorna 200 e dados quando fn resolve", async () => {
    const res = await apiHandler(async () => ({ id: "1" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ id: "1" });
  });

  it("retorna 400 quando lança ZodError", async () => {
    const res = await apiHandler(async () => {
      throw new ZodError([{ path: ["title"], message: "Required", code: "invalid_type", expected: "string", received: "undefined" }]);
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("retorna 404 para Form not found", async () => {
    const res = await apiHandler(async () => {
      throw new Error("Form not found");
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Form not found");
  });

  it("retorna 500 para erro genérico", async () => {
    const res = await apiHandler(async () => {
      throw new Error("Internal error");
    });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Internal error");
  });

  it("retorna 503 para XAI_API_KEY not configured", async () => {
    const res = await apiHandler(async () => {
      throw new Error("XAI_API_KEY not configured");
    });
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe("XAI_API_KEY not configured");
  });
});
