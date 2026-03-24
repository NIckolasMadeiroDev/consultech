import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { generateFormDraftFromPrompt } from "@/modules/ai/generate-form-draft";
import { generateFormDraftRequestSchema } from "@/modules/ai/generate-form-draft.schema";
import { XAIClient } from "@/modules/ai/xai-client";
import { ChatCompletionService } from "@/modules/ai/chat-completion.service";
import { getSession } from "@/lib/auth-session";

function getChatService(): ChatCompletionService {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY not configured");
  }
  const client = new XAIClient(apiKey);
  return new ChatCompletionService(client);
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session?.id) {
      throw new Error("Unauthorized");
    }
    const body = await req.json();
    const { prompt } = generateFormDraftRequestSchema.parse(body);
    const service = getChatService();
    return generateFormDraftFromPrompt(prompt, service);
  });
}
