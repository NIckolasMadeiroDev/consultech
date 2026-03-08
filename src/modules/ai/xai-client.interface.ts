import type {
  XAIChatCompletionRequest,
  XAIChatCompletionResponse,
} from "@/modules/ai/types";

export interface IXAIClient {
  chatCompletions(
    request: XAIChatCompletionRequest
  ): Promise<XAIChatCompletionResponse>;
}
