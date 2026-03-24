import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateForm } from "@/modules/forms/update-form";
import { updateFormSchema } from "@/modules/forms/form.schema";
import { formWithQuestionsDTO, formDTO } from "@/modules/forms/form.dto";
import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
  getFormRevisionRepository,
} from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";
import type { Question } from "@/core/entities";
import { diffFormSnapshots, snapshotFormState } from "@/modules/forms/build-form-revision";

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
    const revisionRepo = getFormRevisionRepository();
    const beforeForm = await formRepo.findById(id);
    if (!beforeForm) {
      throw new Error("Form not found");
    }
    const beforeQs = await questionRepo.findByFormId(id);
    const beforeSnap = snapshotFormState(beforeForm, beforeQs);
    const updated = await updateForm(id, data, formRepo);
    if (data.questions !== undefined) {
      const existing = await questionRepo.findByFormId(id);
      const existingIds = new Set(existing.map((q) => q.id));
      const payloadIds = new Set(
        data.questions.map((q: { id?: string }) => q.id).filter(Boolean) as string[]
      );
      const idsToDelete = existing.filter((q) => !payloadIds.has(q.id)).map((q) => q.id);
      const toUpdate: (Partial<Question> & { id: string })[] = [];
      const toCreate: Array<Omit<Question, "id">> = [];
      data.questions.forEach(
        (
          q: {
            id?: string;
            type: string;
            text: string;
            required: boolean;
            options?: string[];
            scaleMin?: number;
            scaleMax?: number;
            conditionQuestionId?: string | null;
            conditionOperator?: string | null;
            conditionValue?: unknown;
          },
          orderIndex: number
        ) => {
          const shared = {
            type: q.type as Question["type"],
            text: q.text,
            required: q.required,
            orderIndex,
            options: q.options,
            scaleMin: q.scaleMin,
            scaleMax: q.scaleMax,
            conditionQuestionId: q.conditionQuestionId ?? undefined,
            conditionOperator: q.conditionOperator ?? undefined,
            conditionValue: q.conditionValue ?? undefined,
          };
          if (q.id && existingIds.has(q.id)) {
            toUpdate.push({
              id: q.id,
              ...shared,
            });
          } else if (!q.id) {
            toCreate.push({
              formId: id,
              ...shared,
            });
          }
        }
      );
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
    const afterForm = await formRepo.findById(id);
    const afterQs = await questionRepo.findByFormId(id);
    if (!afterForm) {
      throw new Error("Form not found");
    }
    const afterSnap = snapshotFormState(afterForm, afterQs);
    const { changed, summary, details } = diffFormSnapshots(beforeSnap, afterSnap);
    const userId = (await getSession(req))?.id ?? null;
    if (changed) {
      const nextVersion = beforeForm.version + 1;
      await formRepo.setVersion(id, nextVersion);
      await revisionRepo.create({
        formId: id,
        version: nextVersion,
        editedById: userId,
        summary,
        details,
      });
    }
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.updated",
      entityType: "form",
      entityId: id,
      userId,
    });
    const finalForm = await formRepo.findById(id);
    return formDTO(finalForm ?? updated);
  });
}
