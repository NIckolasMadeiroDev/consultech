import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { createFormSchema } from "@/modules/forms/form.schema";
import { formListDTO } from "@/modules/forms/form.dto";
import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
  getFormRevisionRepository,
} from "@/infrastructure/database/repositories";
import { getCreatedBy, getSession } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const fromQuery = url.searchParams.get("createdBy");
    const createdBy = fromQuery ?? (await getCreatedBy(req));
    if (!fromQuery && createdBy === "anonymous") {
      throw new Error("Unauthorized");
    }
    const formRepo = getFormRepository();
    const forms = await formRepo.findByCreatedBy(createdBy);
    return forms.map(formListDTO);
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const { createForm } = await import("@/modules/forms/create-form");
    const body = await req.json();
    const data = createFormSchema.parse(body);
    const createdBy = await getCreatedBy(req);
    const formRepo = getFormRepository();
    const questionRepo = getQuestionRepository();
    const form = await createForm(data, createdBy, formRepo, questionRepo);
    const sessionUserId = (await getSession(req))?.id ?? createdBy;
    const revisionRepo = getFormRevisionRepository();
    await revisionRepo.create({
      formId: form.id,
      version: form.version,
      editedById: sessionUserId,
      summary: "Formulário criado",
    });
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.created",
      entityType: "form",
      entityId: form.id,
      userId: sessionUserId,
    });
    return form;
  });
}
