import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getFormRepository, getResponseRepository } from "@/infrastructure/database/repositories";

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
    const summary = await responseRepo.getSummaryByFormId(formId);
    return {
      count: summary.count,
      lastSubmittedAt: summary.lastSubmittedAt?.toISOString() ?? null,
    };
  });
}
