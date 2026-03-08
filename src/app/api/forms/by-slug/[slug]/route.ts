import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { formWithQuestionsDTO } from "@/modules/forms/form.dto";
import { getFormRepository, getQuestionRepository } from "@/infrastructure/database/repositories";

export async function GET(
  _req: NextRequest,
  context: { params: { slug: string } }
) {
  return apiHandler(async () => {
    const { slug } = context.params;
    const formRepo = getFormRepository();
    const form = await formRepo.findBySlug(slug);
    if (!form) {
      throw new Error("Form not found");
    }
    const questionRepo = getQuestionRepository();
    const questions = await questionRepo.findByFormId(form.id);
    return formWithQuestionsDTO(form, questions);
  });
}
