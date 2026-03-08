import type { ChatCompletionResult } from "./types";
import type { IChatCompletionService } from "./chat-completion.service.interface";

export interface ChatCompletionInput {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function chatCompletion(
  input: ChatCompletionInput,
  service: IChatCompletionService
): Promise<ChatCompletionResult> {
  const hasOptions =
    input.model !== undefined ||
    input.temperature !== undefined ||
    input.max_tokens !== undefined;
  return service.complete(input.messages, hasOptions ? {
    model: input.model,
    temperature: input.temperature,
    max_tokens: input.max_tokens,
  } : undefined);
}
