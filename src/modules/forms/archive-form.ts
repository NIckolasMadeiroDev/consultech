import type { IFormRepository } from "./form.repository.interface";

export async function archiveForm(
  formId: string,
  formRepository: IFormRepository
) {
  const form = await formRepository.findById(formId);
  if (!form) {
    throw new Error("Form not found");
  }
  const updated = await formRepository.update(formId, { status: "archived" });
  if (!updated) {
    throw new Error("Failed to archive form");
  }
  return updated;
}
