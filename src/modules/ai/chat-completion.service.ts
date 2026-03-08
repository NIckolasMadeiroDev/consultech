import type { ChatCompletionResult } from "./types";
import type { IXAIClient } from "./xai-client.interface";
import type { IChatCompletionService } from "./chat-completion.service.interface";

const DEFAULT_MODEL = "grok-4-latest";

export class ChatCompletionService implements IChatCompletionService {
  constructor(private readonly client: IXAIClient) {}

  async complete(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options?: { model?: string; temperature?: number; max_tokens?: number }
  ): Promise<ChatCompletionResult> {
    const response = await this.client.chatCompletions({
      messages,
      model: options?.model ?? DEFAULT_MODEL,
      stream: false,
      temperature: options?.temperature ?? 0,
      max_tokens: options?.max_tokens,
    });

    const choice = response.choices[0];
    const result: ChatCompletionResult = {
      content: choice.message.content,
      role: choice.message.role,
      model: response.model,
      usage: response.usage,
    };
    return result;
  }
}
