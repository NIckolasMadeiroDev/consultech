import type { Prisma } from "@prisma/client";
import { isQuestionVisible } from "@/lib/question-visibility";

export type QRow = {
  id: string;
  formId: string;
  type: string;
  text: string;
  orderIndex: number;
  conditionQuestionId: string | null;
  conditionOperator: string | null;
  conditionValue: Prisma.JsonValue;
};

export type ResponseWithAnswers = {
  formId: string;
  answers: Array<{ questionId: string; value: Prisma.JsonValue }>;
};

export function isAnswerProvided(value: unknown, type: string): boolean {
  if (value === null || value === undefined) return false;
  if (type === "checkbox") {
    return Array.isArray(value) && value.length > 0;
  }
  if (type === "yes_no") {
    return typeof value === "boolean";
  }
  if (type === "number" || type === "scale") {
    return typeof value === "number" && !Number.isNaN(value);
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

export function answersToRecord(
  answers: Array<{ questionId: string; value: Prisma.JsonValue }>
): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  for (const a of answers) {
    m[a.questionId] = a.value as unknown;
  }
  return m;
}

export function computeAvgCompletionAndByForm(
  formIds: string[],
  titleById: Map<string, string>,
  questionsByForm: Map<string, QRow[]>,
  responsesByForm: Map<string, ResponseWithAnswers[]>
): {
  avgCompletionRate: number | null;
  byForm: Array<{
    formId: string;
    title: string;
    responseCount: number;
    avgCompletionRate: number | null;
  }>;
} {
  const completionSamples: number[] = [];
  const byForm: Array<{
    formId: string;
    title: string;
    responseCount: number;
    avgCompletionRate: number | null;
  }> = [];

  for (const formId of formIds) {
    const title = titleById.get(formId) ?? formId;
    const qs = questionsByForm.get(formId) ?? [];
    const rs = responsesByForm.get(formId) ?? [];
    const formCompletions: number[] = [];

    for (const r of rs) {
      const map = answersToRecord(r.answers);
      const visible = qs.filter((q) => q.type !== "section" && isQuestionVisible(q, map));
      if (visible.length === 0) continue;
      const answered = visible.filter((q) => isAnswerProvided(map[q.id], q.type)).length;
      const rate = answered / visible.length;
      formCompletions.push(rate);
      completionSamples.push(rate);
    }

    byForm.push({
      formId,
      title,
      responseCount: rs.length,
      avgCompletionRate:
        formCompletions.length > 0
          ? formCompletions.reduce((a, b) => a + b, 0) / formCompletions.length
          : null,
    });
  }

  return {
    avgCompletionRate:
      completionSamples.length > 0
        ? Math.round(
            (completionSamples.reduce((x, y) => x + y, 0) / completionSamples.length) * 1000
          ) / 1000
        : null,
    byForm,
  };
}

export type AbandonmentRow = {
  formId: string;
  formTitle: string;
  questionId: string;
  questionText: string;
  orderIndex: number;
  eligibleResponses: number;
  answeredCount: number;
  responseRatePercent: number;
  abandonmentEstimatePercent: number;
};

export function computeAbandonmentByQuestion(
  formIds: string[],
  titleById: Map<string, string>,
  questionsByForm: Map<string, QRow[]>,
  responsesByForm: Map<string, ResponseWithAnswers[]>
): AbandonmentRow[] {
  const abandonmentByQuestion: AbandonmentRow[] = [];

  for (const formId of formIds) {
    const title = titleById.get(formId) ?? formId;
    const qs = questionsByForm.get(formId) ?? [];
    const rs = responsesByForm.get(formId) ?? [];

    for (const q of qs) {
      if (q.type === "section") continue;
      let eligible = 0;
      let answeredCount = 0;
      for (const r of rs) {
        const map = answersToRecord(r.answers);
        if (!isQuestionVisible(q, map)) continue;
        eligible++;
        if (isAnswerProvided(map[q.id], q.type)) answeredCount++;
      }
      if (eligible === 0) continue;
      const responseRatePercent = (answeredCount / eligible) * 100;
      abandonmentByQuestion.push({
        formId,
        formTitle: title,
        questionId: q.id,
        questionText: q.text,
        orderIndex: q.orderIndex,
        eligibleResponses: eligible,
        answeredCount,
        responseRatePercent: Math.round(responseRatePercent * 10) / 10,
        abandonmentEstimatePercent: Math.round((100 - responseRatePercent) * 10) / 10,
      });
    }
  }

  abandonmentByQuestion.sort(
    (a, b) => a.formTitle.localeCompare(b.formTitle) || a.orderIndex - b.orderIndex
  );

  return abandonmentByQuestion;
}
