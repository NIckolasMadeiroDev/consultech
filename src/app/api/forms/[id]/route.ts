import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateForm } from "@/modules/forms/update-form";
import { updateFormSchema } from "@/modules/forms/form.schema";
import { formWithQuestionsDTO, formDTO } from "@/modules/forms/form.dto";
import { getFormRepository, getQuestionRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id } = context.params;
    const formRepo = getFormRepository();
    const form = await formRepo.findById(id);
    if (!form) {
      throw new Error("Form not found");
    }
    const questionRepo = getQuestionRepository();
    const questions = await questionRepo.findByFormId(id);
    return formWithQuestionsDTO(form, questions);
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id } = context.params;
    const body = await req.json();
    const data = updateFormSchema.parse(body);
    const formRepo = getFormRepository();
    const questionRepo = getQuestionRepository();
    const updated = await updateForm(id, data, formRepo);
    if (data.questions !== undefined) {
      const existing = await questionRepo.findByFormId(id);
      const existingIds = new Set(existing.map((q) => q.id));
      const payloadIds = new Set(
        data.questions.map((q: { id?: string }) => q.id).filter(Boolean) as string[]
      );
      const idsToDelete = existing.filter((q) => !payloadIds.has(q.id)).map((q) => q.id);
      const toUpdate: Array<{ id: string; type: string; text: string; required: boolean; orderIndex: number; options?: string[]; scaleMin?: number; scaleMax?: number }> = [];
      const toCreate: Array<{ formId: string; type: string; text: string; required: boolean; orderIndex: number; options?: string[]; scaleMin?: number; scaleMax?: number }> = [];
      data.questions.forEach((q: { id?: string; type: string; text: string; required: boolean; options?: string[]; scaleMin?: number; scaleMax?: number }, orderIndex: number) => {
        if (q.id && existingIds.has(q.id)) {
          toUpdate.push({ id: q.id, type: q.type, text: q.text, required: q.required, orderIndex, options: q.options, scaleMin: q.scaleMin, scaleMax: q.scaleMax });
        } else if (!q.id) {
          toCreate.push({ formId: id, type: q.type, text: q.text, required: q.required, orderIndex, options: q.options, scaleMin: q.scaleMin, scaleMax: q.scaleMax });
        }
      });
      if (toUpdate.length > 0) {
        await questionRepo.updateMany(id, toUpdate);
      }
      if (toCreate.length > 0) {
        await questionRepo.createMany(toCreate);
      }
      if (idsToDelete.length > 0) {
        await questionRepo.deleteManyIds(idsToDelete);
      }
    }
    const userId = (await getSession(req))?.id ?? null;
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.updated",
      entityType: "form",
      entityId: id,
      userId,
    });
    return formDTO(updated);
  });
}
