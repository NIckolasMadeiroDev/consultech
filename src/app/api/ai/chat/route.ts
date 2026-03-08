import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { chatCompletionRequestSchema } from "@/modules/ai/chat.schema";
import { chatCompletion } from "@/modules/ai/chat-completion";
import { XAIClient } from "@/modules/ai/xai-client";
import { ChatCompletionService } from "@/modules/ai/chat-completion.service";

function getChatService(): ChatCompletionService {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY not configured");
  }
  const client = new XAIClient(apiKey);
  return new ChatCompletionService(client);
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json();
    const data = chatCompletionRequestSchema.parse(body);
    const service = getChatService();
    return chatCompletion(
      {
        messages: data.messages,
        model: data.model,
        temperature: data.temperature,
        max_tokens: data.max_tokens,
      },
      service
    );
  });
}
