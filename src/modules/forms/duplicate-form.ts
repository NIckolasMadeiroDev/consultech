import type { Question } from "@/core/entities";
import type { IFormRepository } from "./form.repository.interface";
import type { IQuestionRepository } from "./question.repository.interface";

export async function duplicateForm(
  formId: string,
  createdBy: string,
  formRepository: IFormRepository,
  questionRepository: IQuestionRepository
) {
  const existing = await formRepository.findById(formId);
  if (!existing) {
    throw new Error("Form not found");
  }
  const newForm = await formRepository.duplicate(formId, createdBy);
  if (!newForm) {
    throw new Error("Failed to duplicate form");
  }
  const questions = await questionRepository.findByFormId(formId);
  if (questions.length === 0) {
    return newForm;
  }
  const sorted = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
  const stripped: Array<Omit<Question, "id">> = sorted.map((q) => ({
    formId: newForm.id,
    type: q.type,
    text: q.text,
    required: q.required,
    orderIndex: q.orderIndex,
    options: q.options,
    scaleMin: q.scaleMin,
    scaleMax: q.scaleMax,
    conditionQuestionId: q.conditionQuestionId,
    conditionOperator: q.conditionOperator,
    conditionValue: q.conditionValue,
    sectionTitle: q.sectionTitle,
    sectionDescription: q.sectionDescription,
    helpText: q.helpText,
    placeholder: q.placeholder,
    contentHtml: q.contentHtml,
    imageUrl: q.imageUrl,
    videoUrl: q.videoUrl,
    imageAlt: q.imageAlt,
    separatorStyle: q.separatorStyle,
    fileDownloadUrl: q.fileDownloadUrl,
    fileDownloadLabel: q.fileDownloadLabel,
    fileDownloadMime: q.fileDownloadMime,
    fileUploadRules: q.fileUploadRules,
  }));
  const created = await questionRepository.createMany(stripped);
  const idMap = new Map<string, string>();
  sorted.forEach((q, i) => {
    const c = created[i];
    if (c) idMap.set(q.id, c.id);
  });
  const conditionUpdates: Array<Partial<Question> & { id: string }> = [];
  for (const q of sorted) {
    if (!q.conditionQuestionId) continue;
    const newQid = idMap.get(q.id);
    const newCond = idMap.get(q.conditionQuestionId);
    if (!newQid || !newCond) continue;
    conditionUpdates.push({
      id: newQid,
      conditionQuestionId: newCond,
      conditionOperator: q.conditionOperator,
      conditionValue: q.conditionValue,
    });
  }
  if (conditionUpdates.length > 0) {
    await questionRepository.updateMany(newForm.id, conditionUpdates);
  }
  return newForm;
}
