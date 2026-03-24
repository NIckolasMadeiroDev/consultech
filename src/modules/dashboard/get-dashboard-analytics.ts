import type { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";
import { isQuestionVisible } from "@/lib/question-visibility";

type QRow = {
  id: string;
  formId: string;
  type: string;
  text: string;
  orderIndex: number;
  conditionQuestionId: string | null;
  conditionOperator: string | null;
  conditionValue: Prisma.JsonValue;
};

function isAnswerProvided(value: unknown, type: string): boolean {
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

function answersToRecord(
  answers: Array<{ questionId: string; value: Prisma.JsonValue }>
): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  for (const a of answers) {
    m[a.questionId] = a.value as unknown;
  }
  return m;
}

export type DashboardAnalyticsResult = {
  avgCompletionRate: number | null;
  byForm: Array<{
    formId: string;
    title: string;
    responseCount: number;
    avgCompletionRate: number | null;
  }>;
  abandonmentByQuestion: Array<{
    formId: string;
    formTitle: string;
    questionId: string;
    questionText: string;
    orderIndex: number;
    eligibleResponses: number;
    answeredCount: number;
    responseRatePercent: number;
    abandonmentEstimatePercent: number;
  }>;
  avgTimePerResponseSeconds: null;
  avgTimeHint: string;
};

export async function getDashboardAnalytics(
  formIds: string[],
  filters?: { startDate?: Date; endDate?: Date }
): Promise<DashboardAnalyticsResult> {
  const empty: DashboardAnalyticsResult = {
    avgCompletionRate: null,
    byForm: [],
    abandonmentByQuestion: [],
    avgTimePerResponseSeconds: null,
    avgTimeHint:
      "Quando o sistema gravar timestamps por etapa, o tempo médio por resposta poderá ser exibido aqui.",
  };
  if (formIds.length === 0) return empty;

  const whereResponse: Prisma.ResponseWhereInput = { formId: { in: formIds } };
  if (filters?.startDate ?? filters?.endDate) {
    whereResponse.submittedAt = {};
    if (filters.startDate) {
      (whereResponse.submittedAt as { gte?: Date }).gte = filters.startDate;
    }
    if (filters.endDate) {
      (whereResponse.submittedAt as { lte?: Date }).lte = filters.endDate;
    }
  }

  const [forms, questions, responses] = await Promise.all([
    prisma.form.findMany({
      where: { id: { in: formIds } },
      select: { id: true, title: true },
    }),
    prisma.question.findMany({
      where: { formId: { in: formIds } },
      orderBy: [{ formId: "asc" }, { orderIndex: "asc" }],
    }),
    prisma.response.findMany({
      where: whereResponse,
      include: { answers: true },
    }),
  ]);

  const titleById = new Map(forms.map((f) => [f.id, f.title]));
  const questionsByForm = new Map<string, QRow[]>();
  for (const q of questions) {
    const row: QRow = {
      id: q.id,
      formId: q.formId,
      type: q.type,
      text: q.text,
      orderIndex: q.orderIndex,
      conditionQuestionId: q.conditionQuestionId,
      conditionOperator: q.conditionOperator,
      conditionValue: q.conditionValue,
    };
    const list = questionsByForm.get(q.formId) ?? [];
    list.push(row);
    questionsByForm.set(q.formId, list);
  }

  const responsesByForm = new Map<string, typeof responses>();
  for (const r of responses) {
    const list = responsesByForm.get(r.formId) ?? [];
    list.push(r);
    responsesByForm.set(r.formId, list);
  }

  const completionSamples: number[] = [];
  const byForm: DashboardAnalyticsResult["byForm"] = [];

  for (const formId of formIds) {
    const title = titleById.get(formId) ?? formId;
    const qs = questionsByForm.get(formId) ?? [];
    const rs = responsesByForm.get(formId) ?? [];
    const formCompletions: number[] = [];

    for (const r of rs) {
      const map = answersToRecord(r.answers);
      const visible = qs.filter(
        (q) => q.type !== "section" && isQuestionVisible(q, map)
      );
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

  const abandonmentByQuestion: DashboardAnalyticsResult["abandonmentByQuestion"] = [];

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

  return {
    avgCompletionRate:
      completionSamples.length > 0
        ? Math.round(
            (completionSamples.reduce((x, y) => x + y, 0) / completionSamples.length) * 1000
          ) / 1000
        : null,
    byForm,
    abandonmentByQuestion,
    avgTimePerResponseSeconds: null,
    avgTimeHint: empty.avgTimeHint,
  };
}
