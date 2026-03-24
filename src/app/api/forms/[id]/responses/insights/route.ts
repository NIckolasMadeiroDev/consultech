import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { buildInsightsAggregate } from "@/modules/responses/build-insights-aggregate";
import { summarizeResponsesInsightsBodySchema } from "@/modules/ai/summarize-responses-insights.schema";
import {
  responseFiltersFromInsightsBody,
  summarizeResponsesInsights,
} from "@/modules/ai/summarize-responses-insights";
import { XAIClient } from "@/modules/ai/xai-client";
import { ChatCompletionService } from "@/modules/ai/chat-completion.service";
import { getSession } from "@/lib/auth-session";
import {
  getFormRepository,
  getQuestionRepository,
  getResponseRepository,
  getAuditLogRepository,
} from "@/infrastructure/database/repositories";

function getChatService(): ChatCompletionService {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY not configured");
  }
  return new ChatCompletionService(new XAIClient(apiKey));
}

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session?.id) {
      throw new Error("Unauthorized");
    }
    const { id: formId } = context.params;
    const body = summarizeResponsesInsightsBodySchema.parse(await req.json());
    const filters = responseFiltersFromInsightsBody(body);
    const formRepo = getFormRepository();
    const form = await formRepo.findById(formId);
    if (!form) {
      throw new Error("Form not found");
    }
    const responseRepo = getResponseRepository();
    const summary = await responseRepo.getSummaryByFormId(formId, filters);
    if (summary.count === 0) {
      throw new Error("Nenhuma resposta para analisar");
    }
    const rows = await responseRepo.findRecentByFormIdWithAnswers(formId, filters, 500);
    const questionRepo = getQuestionRepository();
    const questions = await questionRepo.findByFormId(formId);
    const aggregate = buildInsightsAggregate(form.title, questions, rows, summary.count);
    const service = getChatService();
    const content = await summarizeResponsesInsights(aggregate, body.mode, service);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.responses_insights_ai",
      entityType: "form",
      entityId: formId,
      userId: session.id,
      metadata: {
        mode: body.mode,
        sampleSize: aggregate.sampleSize,
        totalMatching: summary.count,
      },
    });
    return {
      content,
      meta: {
        mode: body.mode,
        totalMatchingResponses: summary.count,
        sampleSize: aggregate.sampleSize,
        sampleIsPartial: aggregate.sampleIsPartial,
      },
    };
  });
}
