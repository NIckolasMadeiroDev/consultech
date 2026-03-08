import type {
  XAIChatCompletionRequest,
  XAIChatCompletionResponse,
} from "./types";
import type { IXAIClient } from "./xai-client.interface";

const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";

export class XAIClient implements IXAIClient {
  constructor(private readonly apiKey: string) {}

  async chatCompletions(
    request: XAIChatCompletionRequest
  ): Promise<XAIChatCompletionResponse> {
    const response = await fetch(XAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages: request.messages,
        model: request.model,
        stream: request.stream ?? false,
        temperature: request.temperature ?? 0,
        max_tokens: request.max_tokens,
      }),
    });

    const data = (await response.json()) as XAIChatCompletionResponse & {
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.status}`);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No completion choices returned");
    }

    return data as XAIChatCompletionResponse;
  }
}
