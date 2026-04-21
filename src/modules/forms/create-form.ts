import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import type { CreateFormInput } from "./form.schema";
import type { IFormRepository } from "./form.repository.interface";
import type { IQuestionRepository } from "./question.repository.interface";
import { normalizeQuestionForPersistence } from "./normalize-question-payload";

export async function createForm(
  data: CreateFormInput,
  createdBy: string,
  formRepository: IFormRepository,
  questionRepository?: IQuestionRepository
) {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Title required");
  }
  if (!data.questions.some((q) => acceptsAnswerValue(q.type))) {
    throw new Error("At least one question required");
  }
  const form = await formRepository.create({
    title: data.title.trim(),
    description: data.description,
    closingMessage: data.closingMessage?.trim() || undefined,
    pausedMessage: data.pausedMessage?.trim() || undefined,
    folderId: data.folderId ?? undefined,
    isTemplate: data.isTemplate ?? false,
    createdBy,
    slug: data.slug?.trim() || undefined,
    allowAnonymous: data.allowAnonymous ?? false,
    status: data.initialStatus ?? "draft",
  });
  if (questionRepository && data.questions.length > 0) {
    await questionRepository.createMany(
      data.questions.map((q, idx) => {
        const n = normalizeQuestionForPersistence(q);
        return {
          formId: form.id,
          type: n.type,
          text: n.text,
          required: n.required,
          orderIndex: n.orderIndex ?? idx,
          options: n.options,
          scaleMin: n.scaleMin,
          scaleMax: n.scaleMax,
          conditionQuestionId: n.conditionQuestionId ?? undefined,
          conditionOperator: n.conditionOperator ?? undefined,
          conditionValue: n.conditionValue ?? undefined,
          sectionTitle: n.sectionTitle ?? undefined,
          sectionDescription: n.sectionDescription ?? undefined,
          helpText: n.helpText ?? undefined,
          placeholder: n.placeholder ?? undefined,
          contentHtml: n.contentHtml ?? undefined,
          imageUrl: n.imageUrl ?? undefined,
          videoUrl: n.videoUrl ?? undefined,
          imageAlt: n.imageAlt ?? undefined,
          separatorStyle: n.separatorStyle ?? undefined,
          fileDownloadUrl: n.fileDownloadUrl ?? undefined,
          fileDownloadLabel: n.fileDownloadLabel ?? undefined,
          fileDownloadMime: n.fileDownloadMime ?? undefined,
          fileUploadRules: n.fileUploadRules ?? undefined,
        };
      })
    );
  }
  return form;
}
