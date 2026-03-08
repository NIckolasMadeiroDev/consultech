import { describe, it, expect, vi } from "vitest";
import { chatCompletion } from "./chat-completion";

describe("chatCompletion", () => {
  it("deve retornar resultado do service", async () => {
    const service = {
      complete: vi.fn().mockResolvedValue({
        content: "Hello",
        role: "assistant",
        model: "grok-4-latest",
        usage: { total_tokens: 10 },
      }),
    };
    const result = await chatCompletion(
      {
        messages: [{ role: "user", content: "Hi" }],
      },
      service as never
    );
    expect(result.content).toBe("Hello");
    expect(result.role).toBe("assistant");
    expect(service.complete).toHaveBeenCalledWith(
      [{ role: "user", content: "Hi" }],
      undefined
    );
  });

  it("deve repassar options para o service", async () => {
    const service = {
      complete: vi.fn().mockResolvedValue({
        content: "Ok",
        role: "assistant",
        model: "grok-3",
      }),
    };
    await chatCompletion(
      {
        messages: [{ role: "system", content: "You are helpful." }, { role: "user", content: "Hi" }],
        model: "grok-3",
        temperature: 0.5,
        max_tokens: 100,
      },
      service as never
    );
    expect(service.complete).toHaveBeenCalledWith(
      [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "Hi" },
      ],
      { model: "grok-3", temperature: 0.5, max_tokens: 100 }
    );
  });
});
