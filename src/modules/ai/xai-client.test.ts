import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { XAIClient } from "./xai-client";

describe("XAIClient", () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("deve chamar api.x.ai com Authorization Bearer", async () => {
    const mockResponse = {
      id: "chatcmpl-1",
      object: "chat.completion",
      created: 1,
      model: "grok-4-latest",
      choices: [
        {
          index: 0,
          message: { role: "assistant" as const, content: "Hello" },
          finish_reason: "stop",
        },
      ],
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    const client = new XAIClient("sk-test-key");
    await client.chatCompletions({
      messages: [{ role: "user", content: "Hi" }],
      model: "grok-4-latest",
      stream: false,
      temperature: 0,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.x.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer sk-test-key",
        }),
      })
    );
  });

  it("deve retornar choices[0].message quando ok", async () => {
    const mockResponse = {
      id: "chatcmpl-1",
      object: "chat.completion",
      created: 1,
      model: "grok-4-latest",
      choices: [
        {
          index: 0,
          message: { role: "assistant" as const, content: "Hello world" },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    const client = new XAIClient("sk-test");
    const result = await client.chatCompletions({
      messages: [{ role: "user", content: "Hi" }],
      model: "grok-4-latest",
      stream: false,
    });
    expect(result.choices).toHaveLength(1);
    expect(result.choices[0].message.content).toBe("Hello world");
    expect(result.choices[0].message.role).toBe("assistant");
    expect(result.usage?.total_tokens).toBe(12);
  });

  it("deve lançar erro quando response não ok", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: "Invalid API key" } }),
    });
    const client = new XAIClient("bad-key");
    await expect(
      client.chatCompletions({
        messages: [{ role: "user", content: "Hi" }],
        model: "grok-4-latest",
        stream: false,
      })
    ).rejects.toThrow("xAI API error: 401");
  });

  it("deve lançar erro quando choices está vazio", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "1",
          object: "chat.completion",
          created: 1,
          model: "grok-4-latest",
          choices: [],
        }),
    });
    const client = new XAIClient("sk-test");
    await expect(
      client.chatCompletions({
        messages: [{ role: "user", content: "Hi" }],
        model: "grok-4-latest",
        stream: false,
      })
    ).rejects.toThrow("No completion choices returned");
  });
});
