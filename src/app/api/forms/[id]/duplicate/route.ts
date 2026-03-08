import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { duplicateForm } from "@/modules/forms/duplicate-form";
import { formDTO } from "@/modules/forms/form.dto";
import { getFormRepository, getQuestionRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getCreatedBy, getSession } from "@/lib/auth-session";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id } = context.params;
    const createdBy = await getCreatedBy(req);
    const formRepo = getFormRepository();
    const questionRepo = getQuestionRepository();
    const newForm = await duplicateForm(id, createdBy, formRepo, questionRepo);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.duplicated",
      entityType: "form",
      entityId: newForm.id,
      userId: (await getSession(req))?.id ?? createdBy,
      metadata: { sourceFormId: id },
    });
    return formDTO(newForm);
  });
}
