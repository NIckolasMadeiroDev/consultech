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
  if (questions.length > 0) {
    await questionRepository.createMany(
      questions.map((q) => ({
        formId: newForm.id,
        type: q.type,
        text: q.text,
        required: q.required,
        orderIndex: q.orderIndex,
        options: q.options,
        scaleMin: q.scaleMin,
        scaleMax: q.scaleMax,
      }))
    );
  }
  return newForm;
}
