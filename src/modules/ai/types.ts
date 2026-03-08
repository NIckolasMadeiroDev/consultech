export type XAIChatRole = "system" | "user" | "assistant";

export interface XAIChatMessage {
  role: XAIChatRole;
  content: string;
}

export interface XAIChatCompletionRequest {
  messages: XAIChatMessage[];
  model: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface XAIChatChoice {
  index: number;
  message: XAIChatMessage;
  finish_reason: string;
}

export interface XAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: XAIChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionResult {
  content: string;
  role: XAIChatRole;
  model: string;
  usage?: XAIChatCompletionResponse["usage"];
}
