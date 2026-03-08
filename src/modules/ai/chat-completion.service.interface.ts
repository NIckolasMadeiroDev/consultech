import type { ChatCompletionResult } from "./types";

export interface IChatCompletionService {
  complete(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options?: { model?: string; temperature?: number; max_tokens?: number }
  ): Promise<ChatCompletionResult>;
}
