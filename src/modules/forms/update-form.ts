import type { UpdateFormInput } from "./form.schema";
import type { IFormRepository } from "./form.repository.interface";

export async function updateForm(
  formId: string,
  data: UpdateFormInput,
  formRepository: IFormRepository
) {
  const existing = await formRepository.findById(formId);
  if (!existing) {
    throw new Error("Form not found");
  }
  if (data.title !== undefined && data.title.trim().length === 0) {
    throw new Error("Title cannot be empty");
  }
  const updated = await formRepository.update(formId, data);
  if (!updated) {
    throw new Error("Failed to update form");
  }
  return updated;
}
