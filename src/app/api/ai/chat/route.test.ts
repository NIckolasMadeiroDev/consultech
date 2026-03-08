import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/ai/chat/route";

const originalEnv = process.env;

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    process.env = { ...originalEnv, XAI_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("retorna 503 quando XAI_API_KEY não está configurada", async () => {
    delete process.env.XAI_API_KEY;
    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hi" }],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toContain("XAI_API_KEY");
  });

  it("retorna 400 quando body inválido (messages vazio)", async () => {
    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retorna 200 e completion quando request válido e API responde ok", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "1",
          object: "chat.completion",
          created: 1,
          model: "grok-4-latest",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hello world" },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 5,
            completion_tokens: 2,
            total_tokens: 7,
          },
        }),
    });
    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Say hello world." },
        ],
        model: "grok-4-latest",
        stream: false,
        temperature: 0,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.content).toBe("Hello world");
    expect(json.role).toBe("assistant");
    expect(json.model).toBe("grok-4-latest");
    expect(json.usage.total_tokens).toBe(7);
  });
});
