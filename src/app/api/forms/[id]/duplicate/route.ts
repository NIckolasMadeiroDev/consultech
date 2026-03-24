import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { duplicateForm } from "@/modules/forms/duplicate-form";
import { formDTO } from "@/modules/forms/form.dto";
import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
  getFormRevisionRepository,
} from "@/infrastructure/database/repositories";
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
    const source = await formRepo.findById(id);
    const newForm = await duplicateForm(id, createdBy, formRepo, questionRepo);
    const sessionUserId = (await getSession(req))?.id ?? createdBy;
    const revisionRepo = getFormRevisionRepository();
    const sourceTitle = source?.title ?? id;
    await revisionRepo.create({
      formId: newForm.id,
      version: newForm.version,
      editedById: sessionUserId,
      summary: `Duplicado de «${sourceTitle}»`,
      details: { sourceFormId: id },
    });
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.duplicated",
      entityType: "form",
      entityId: newForm.id,
      userId: sessionUserId,
      metadata: { sourceFormId: id },
    });
    return formDTO(newForm);
  });
}
