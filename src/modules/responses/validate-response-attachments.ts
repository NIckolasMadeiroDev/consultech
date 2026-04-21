import type { Question } from "@/core/entities";
import type { ResponseAttachmentInput } from "./response-attachment.types";

function maxFilesForQuestion(q: Question): number {
  const m = q.fileUploadRules?.maxFiles;
  if (typeof m === "number" && m > 0) return Math.min(m, 50);
  return 1;
}

export function validateResponseAttachments(
  formId: string,
  questions: Question[],
  attachments: ResponseAttachmentInput[] | undefined,
  options?: { allowedQuestionIds?: Set<string> }
): void {
  let fileQuestions = questions.filter((q) => q.type === "file_upload");
  if (options?.allowedQuestionIds) {
    const allow = options.allowedQuestionIds;
    fileQuestions = fileQuestions.filter((q) => allow.has(q.id));
  }
  const fileQuestionIds = new Set(fileQuestions.map((q) => q.id));
  const prefix = `responses/${formId}/`;

  if (!attachments?.length) {
    for (const q of fileQuestions) {
      if (q.fileUploadRules?.required) {
        throw new Error("Attachment required");
      }
    }
    return;
  }

  const countByQuestion = new Map<string, number>();
  for (const a of attachments) {
    if (!fileQuestionIds.has(a.questionId)) {
      throw new Error("Invalid attachment question");
    }
    if (!a.storagePath.startsWith(prefix)) {
      throw new Error("Invalid storage path");
    }
    const expected = `${prefix}${a.questionId}/`;
    if (!a.storagePath.startsWith(expected)) {
      throw new Error("Invalid storage path");
    }
    countByQuestion.set(a.questionId, (countByQuestion.get(a.questionId) ?? 0) + 1);
  }

  for (const q of fileQuestions) {
    const n = countByQuestion.get(q.id) ?? 0;
    const max = maxFilesForQuestion(q);
    if (n > max) {
      throw new Error("Too many attachments for question");
    }
    if (q.fileUploadRules?.required && n === 0) {
      throw new Error("Attachment required");
    }
  }
}
