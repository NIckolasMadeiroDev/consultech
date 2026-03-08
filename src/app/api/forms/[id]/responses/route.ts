import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getFormRepository, getResponseRepository, getRespondentRepository } from "@/infrastructure/database/repositories";

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
    const responses = await responseRepo.findByFormId(formId);
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
