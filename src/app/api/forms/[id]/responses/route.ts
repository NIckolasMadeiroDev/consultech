import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getFormRepository, getResponseRepository, getRespondentRepository } from "@/infrastructure/database/repositories";

function parseFilters(url: URL): { startDate?: Date; endDate?: Date } | undefined {
  const start = url.searchParams.get("startDate");
  const end = url.searchParams.get("endDate");
  if (!start && !end) return undefined;
  const filters: { startDate?: Date; endDate?: Date } = {};
  if (start) {
    const d = new Date(start);
    if (!Number.isNaN(d.getTime())) filters.startDate = d;
  }
  if (end) {
    const d = new Date(end);
    if (!Number.isNaN(d.getTime())) filters.endDate = d;
  }
  return Object.keys(filters).length > 0 ? filters : undefined;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id: formId } = context.params;
    const formRepo = getFormRepository();
    const form = await formRepo.findById(formId);
    if (!form) {
      throw new Error("Form not found");
    }
    const responseRepo = getResponseRepository();
    const respondentRepo = getRespondentRepository();
    const url = new URL(req.url);
    const filters = parseFilters(url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");
    const usePagination = pageParam !== null || limitParam !== null;
    const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam ?? "20", 10) || 20));

    if (usePagination) {
      const { data: responses, total } = await responseRepo.findPageByFormId(formId, {
        filters,
        page,
        limit,
      });
      const result = await Promise.all(
        responses.map(async (r) => {
          const [respondent, answers] = await Promise.all([
            respondentRepo.findById(r.respondentId),
            responseRepo.getAnswersByResponseId(r.id),
          ]);
          return {
            id: r.id,
            formId: r.formId,
            respondentId: r.respondentId,
            submittedAt: r.submittedAt,
            respondent: respondent
              ? {
                  id: respondent.id,
                  name: respondent.name,
                  email: respondent.email,
                  employeeId: respondent.employeeId,
                  department: respondent.department,
                }
              : null,
            answers: answers.map((a) => ({ questionId: a.questionId, value: a.value })),
          };
        })
      );
      return { data: result, total, page, limit };
    }

    const responses = await responseRepo.findByFormId(formId, filters);
    const result = await Promise.all(
      responses.map(async (r) => {
        const [respondent, answers] = await Promise.all([
          respondentRepo.findById(r.respondentId),
          responseRepo.getAnswersByResponseId(r.id),
        ]);
        return {
          id: r.id,
          formId: r.formId,
          respondentId: r.respondentId,
          submittedAt: r.submittedAt,
          respondent: respondent
            ? {
                id: respondent.id,
                name: respondent.name,
                email: respondent.email,
                employeeId: respondent.employeeId,
                department: respondent.department,
              }
            : null,
          answers: answers.map((a) => ({ questionId: a.questionId, value: a.value })),
        };
      })
    );
    return result;
  });
}
