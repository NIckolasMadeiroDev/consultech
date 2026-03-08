import { describe, it, expect, vi } from "vitest";
import { ChatCompletionService } from "./chat-completion.service";

describe("ChatCompletionService", () => {
  it("deve retornar content e role do primeiro choice", async () => {
    const client = {
      chatCompletions: vi.fn().mockResolvedValue({
        id: "1",
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
        usage: {
          prompt_tokens: 5,
          completion_tokens: 2,
          total_tokens: 7,
        },
      }),
    };
    const service = new ChatCompletionService(client as never);
    const result = await service.complete([
      { role: "user", content: "Say hello" },
    ]);
    expect(result.content).toBe("Hello world");
    expect(result.role).toBe("assistant");
    expect(result.model).toBe("grok-4-latest");
    expect(result.usage?.total_tokens).toBe(7);
    expect(client.chatCompletions).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "Say hello" }],
        model: "grok-4-latest",
        stream: false,
        temperature: 0,
      })
    );
  });

  it("deve aceitar options model e temperature", async () => {
    const client = {
      chatCompletions: vi.fn().mockResolvedValue({
        id: "1",
        object: "chat.completion",
        created: 1,
        model: "grok-3",
        choices: [
          {
            index: 0,
            message: { role: "assistant" as const, content: "Hi" },
            finish_reason: "stop",
          },
        ],
      }),
    };
    const service = new ChatCompletionService(client as never);
    await service.complete(
      [{ role: "user", content: "Hi" }],
      { model: "grok-3", temperature: 0.7 }
    );
    expect(client.chatCompletions).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "grok-3",
        temperature: 0.7,
      })
    );
  });

  it("deve repassar erro do client", async () => {
    const client = {
      chatCompletions: vi.fn().mockRejectedValue(new Error("API error")),
    };
    const service = new ChatCompletionService(client as never);
    await expect(
      service.complete([{ role: "user", content: "Hi" }])
    ).rejects.toThrow("API error");
  });
});
