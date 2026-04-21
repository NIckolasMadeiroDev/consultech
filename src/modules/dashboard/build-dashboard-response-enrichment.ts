import { aggregateAnswersByQuestion } from "@/modules/responses/aggregate-answers-by-question";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import { toQuestionEntity } from "@/modules/forms/infrastructure/prisma-question.repository";
import type { ResponseWithAnswers } from "./dashboard-analytics-flow";

export function computeHideAbandonmentDefault(
  formIds: string[],
  prismaQuestions: Array<{
    formId: string;
    type: string;
    required: boolean;
  }>
): boolean {
  const flags = formIds.map((formId) => {
    const answerable = prismaQuestions.filter(
      (q) => q.formId === formId && acceptsAnswerValue(q.type)
    );
    if (answerable.length === 0) return false;
    return answerable.every((q) => q.required);
  });
  return flags.length > 0 && flags.every(Boolean);
}

export type PrismaQuestionRow = Parameters<typeof toQuestionEntity>[0];

export function buildResponseContentByForm(
  formIds: string[],
  titleById: Map<string, string>,
  prismaQuestions: PrismaQuestionRow[],
  responsesByForm: Map<string, ResponseWithAnswers[]>
) {
  return formIds.map((formId) => {
    const title = titleById.get(formId) ?? formId;
    const qRows = prismaQuestions.filter((q) => q.formId === formId);
    const entities = qRows.map((row) => toQuestionEntity(row));
    const rows = responsesByForm.get(formId) ?? [];
    const aggregates = aggregateAnswersByQuestion(entities, rows);
    const answerable = entities.filter((q) => acceptsAnswerValue(q.type));
    const allAnswerableRequired =
      answerable.length > 0 && answerable.every((q) => q.required);
    return {
      formId,
      title,
      responseCount: rows.length,
      allAnswerableRequired,
      aggregates,
    };
  });
}
