import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSession } from "@/lib/auth-session";
import {
  getFormRepository,
  getQuestionRepository,
  getResponseRepository,
} from "@/infrastructure/database/repositories";
import type { ResponseFilters } from "@/types";
import { aggregateAnswersByQuestion } from "@/modules/responses/aggregate-answers-by-question";

function parseFilters(url: URL): ResponseFilters | undefined {
  const filters: ResponseFilters = {};
  const start = url.searchParams.get("startDate");
  const end = url.searchParams.get("endDate");
  if (start) {
    const d = new Date(start);
    if (!Number.isNaN(d.getTime())) filters.startDate = d;
  }
  if (end) {
    const d = new Date(end);
    if (!Number.isNaN(d.getTime())) filters.endDate = d;
  }
  const respondentSearch = url.searchParams.get("respondentSearch")?.trim();
  if (respondentSearch) filters.respondentSearch = respondentSearch;
  const answerSearch = url.searchParams.get("answerSearch")?.trim();
  if (answerSearch) filters.answerValue = answerSearch;
  const department = url.searchParams.get("department")?.trim();
  if (department) filters.department = department;
  return Object.keys(filters).length > 0 ? filters : undefined;
}

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session?.id) {
      throw new Error("Unauthorized");
    }
    const { id: formId } = context.params;
    const formRepo = getFormRepository();
    const form = await formRepo.findById(formId);
    if (!form) {
      throw new Error("Form not found");
    }
    const filters = parseFilters(new URL(req.url));
    const responseRepo = getResponseRepository();
    const questionRepo = getQuestionRepository();
    const questions = await questionRepo.findByFormId(formId);
    const responses = await responseRepo.findByFormId(formId, filters);
    const rows = await Promise.all(
      responses.map(async (r) => {
        const answers = await responseRepo.getAnswersByResponseId(r.id);
        return {
          answers: answers.map((a) => ({ questionId: a.questionId, value: a.value })),
        };
      })
    );
    const aggregates = aggregateAnswersByQuestion(questions, rows);
    return { aggregates };
  });
}
