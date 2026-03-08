import type { CreateFormInput } from "./form.schema";
import type { IFormRepository } from "./form.repository.interface";
import type { IQuestionRepository } from "./question.repository.interface";

export async function createForm(
  data: CreateFormInput,
  createdBy: string,
  formRepository: IFormRepository,
  questionRepository?: IQuestionRepository
) {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Title required");
  }
  if (!data.questions || data.questions.length === 0) {
    throw new Error("At least one question required");
  }
  const form = await formRepository.create({
    title: data.title.trim(),
    description: data.description,
    createdBy,
    slug: data.slug?.trim() || undefined,
    allowAnonymous: data.allowAnonymous ?? false,
  });
  if (questionRepository && data.questions.length > 0) {
    await questionRepository.createMany(
      data.questions.map((q, idx) => ({
        formId: form.id,
        type: q.type,
        text: q.text,
        required: q.required,
        orderIndex: q.orderIndex ?? idx,
        options: q.options,
        scaleMin: q.scaleMin,
        scaleMax: q.scaleMax,
        conditionQuestionId: q.conditionQuestionId ?? undefined,
        conditionOperator: q.conditionOperator ?? undefined,
        conditionValue: q.conditionValue ?? undefined,
      }))
    );
  }
  return form;
}
