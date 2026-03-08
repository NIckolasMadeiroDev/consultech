import type { SubmitResponseInput } from "./response.schema";
import type { IFormRepository } from "../forms/form.repository.interface";
import type { IRespondentRepository } from "./respondent.repository.interface";
import type { IResponseRepository } from "./response.repository.interface";

export async function submitResponse(
  data: SubmitResponseInput,
  formRepository: IFormRepository,
  respondentRepository: IRespondentRepository,
  responseRepository: IResponseRepository
) {
  const form = await formRepository.findById(data.formId);
  if (!form) {
    throw new Error("Form not found");
  }
  if (form.status === "archived" || form.status === "paused") {
    throw new Error("Form does not accept responses");
  }
  let respondent;
  if (data.respondent) {
    respondent = await respondentRepository.create(data.respondent);
  } else if (form.allowAnonymous) {
    respondent = await respondentRepository.create({
      name: "Anônimo",
      email: `anonymous-${crypto.randomUUID()}@anonymous.local`,
    });
  } else {
    throw new Error("Respondent data is required");
  }
  const response = await responseRepository.create({
    formId: data.formId,
    respondentId: respondent.id,
    answers: data.answers,
  });
  return response;
}
