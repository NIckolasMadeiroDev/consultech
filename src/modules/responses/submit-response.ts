import type { SubmitResponseInput } from "./response.schema";
import type { IFormRepository } from "../forms/form.repository.interface";
import type { IQuestionRepository } from "../forms/question.repository.interface";
import type { IRespondentRepository } from "./respondent.repository.interface";
import type { IResponseRepository } from "./response.repository.interface";
import { FormPausedError } from "./form-paused-error";
import { validateResponseAttachments } from "./validate-response-attachments";
import { parseFormResponseSettings } from "@/types/form-response-settings";
import { parseFormSectionVisibilityRules } from "@/types/form-section-visibility";
import { answerableVisibleQuestionIds } from "@/modules/forms/filter-visible-response-questions";
import { assertAnswersRespectVisibility } from "@/modules/responses/validate-submitted-answers-visibility";

export async function submitResponse(
  data: SubmitResponseInput,
  formRepository: IFormRepository,
  respondentRepository: IRespondentRepository,
  responseRepository: IResponseRepository,
  questionRepository: IQuestionRepository
) {
  const form = await formRepository.findById(data.formId);
  if (!form) {
    throw new Error("Form not found");
  }
  if (form.status === "paused") {
    const pm = form.pausedMessage?.trim();
    throw new FormPausedError(pm ? pm : null);
  }
  if (form.status === "archived") {
    throw new Error("Form does not accept responses");
  }
  const settings = parseFormResponseSettings(
    (form as { responseSettings?: unknown }).responseSettings,
    form.allowAnonymous
  );
  const mode = settings.respondentIdentificationMode;
  if (mode === "anonymous" && data.respondent) {
    throw new Error("Identification not accepted for this form");
  }
  let respondentId: string | null = null;
  if (mode === "anonymous") {
    respondentId = null;
  } else if (mode === "required") {
    if (!data.respondent) {
      throw new Error("Respondent data is required");
    }
    const respondent = await respondentRepository.create(data.respondent);
    respondentId = respondent.id;
  } else {
    if (data.respondent) {
      const respondent = await respondentRepository.create(data.respondent);
      respondentId = respondent.id;
    } else {
      respondentId = null;
    }
  }
  const questions = await questionRepository.findByFormId(data.formId);
  const sortedQs = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
  const answersMap = Object.fromEntries(data.answers.map((a) => [a.questionId, a.value]));
  const sectionRules = parseFormSectionVisibilityRules(
    (form as { sectionVisibilityRules?: unknown }).sectionVisibilityRules
  );
  const respondentCtx = data.respondent
    ? { department: data.respondent.department }
    : null;
  const allowedIds = answerableVisibleQuestionIds(
    sortedQs,
    answersMap,
    sectionRules,
    respondentCtx
  );
  assertAnswersRespectVisibility(
    data.answers.map((a) => a.questionId),
    allowedIds
  );
  validateResponseAttachments(data.formId, questions, data.attachments, {
    allowedQuestionIds: allowedIds,
  });
  const submissionMetadata = {
    respondentIdentificationMode: mode,
  };
  const response = await responseRepository.create({
    formId: data.formId,
    respondentId,
    answers: data.answers,
    attachments: data.attachments,
    submissionMetadata,
  });
  return response;
}
