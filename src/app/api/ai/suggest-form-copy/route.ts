import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { suggestFormCopyRequestSchema } from "@/modules/ai/suggest-form-copy.schema";
import { suggestFormCopy } from "@/modules/ai/suggest-form-copy";
import { XAIClient } from "@/modules/ai/xai-client";
import { ChatCompletionService } from "@/modules/ai/chat-completion.service";
import { getSession } from "@/lib/auth-session";

function getChatService(): ChatCompletionService {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY not configured");
  }
  return new ChatCompletionService(new XAIClient(apiKey));
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session?.id) {
      throw new Error("Unauthorized");
    }
    const body = suggestFormCopyRequestSchema.parse(await req.json());
    const service = getChatService();
    const text = await suggestFormCopy(body, service);
    return { text };
  });
}
