import type { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";
import {
  computeAbandonmentByQuestion,
  computeAvgCompletionAndByForm,
  type QRow,
  type ResponseWithAnswers,
} from "./dashboard-analytics-flow";
import {
  buildResponseContentByForm,
  computeHideAbandonmentDefault,
} from "./build-dashboard-response-enrichment";
import type { QuestionAggregate } from "@/modules/responses/aggregate-answers-by-question";

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
  hideAbandonmentByDefault: boolean;
  responseContentByForm: Array<{
    formId: string;
    title: string;
    responseCount: number;
    allAnswerableRequired: boolean;
    aggregates: QuestionAggregate[];
  }>;
};

export async function getDashboardAnalytics(
  formIds: string[],
  filters?: { startDate?: Date; endDate?: Date }
): Promise<DashboardAnalyticsResult> {
  const avgTimeHint =
    "Quando o sistema gravar timestamps por etapa, o tempo médio por resposta poderá ser exibido aquí.";
  const empty: DashboardAnalyticsResult = {
    avgCompletionRate: null,
    byForm: [],
    abandonmentByQuestion: [],
    avgTimePerResponseSeconds: null,
    avgTimeHint,
    hideAbandonmentByDefault: false,
    responseContentByForm: [],
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

  const responsesByForm = new Map<string, ResponseWithAnswers[]>();
  for (const r of responses) {
    const list = responsesByForm.get(r.formId) ?? [];
    list.push({
      formId: r.formId,
      answers: r.answers.map((a) => ({
        questionId: a.questionId,
        value: a.value,
      })),
    });
    responsesByForm.set(r.formId, list);
  }

  const { avgCompletionRate, byForm } = computeAvgCompletionAndByForm(
    formIds,
    titleById,
    questionsByForm,
    responsesByForm
  );
  const abandonmentByQuestion = computeAbandonmentByQuestion(
    formIds,
    titleById,
    questionsByForm,
    responsesByForm
  );
  const hideAbandonmentByDefault = computeHideAbandonmentDefault(formIds, questions);
  const responseContentByForm = buildResponseContentByForm(
    formIds,
    titleById,
    questions,
    responsesByForm
  );

  return {
    avgCompletionRate,
    byForm,
    abandonmentByQuestion,
    avgTimePerResponseSeconds: null,
    avgTimeHint,
    hideAbandonmentByDefault,
    responseContentByForm,
  };
}
