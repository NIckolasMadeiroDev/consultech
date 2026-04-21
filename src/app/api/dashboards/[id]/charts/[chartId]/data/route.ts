import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { distributionLabelsForChart } from "@/modules/responses/aggregate-answers-by-question";
import type { QuestionType } from "@/types";

export const dynamic = "force-dynamic";

function parseDateFilters(url: URL): { startDate?: Date; endDate?: Date } {
  const start = url.searchParams.get("startDate");
  const end = url.searchParams.get("endDate");
  const out: { startDate?: Date; endDate?: Date } = {};
  if (start) {
    const d = new Date(start);
    if (!Number.isNaN(d.getTime())) out.startDate = d;
  }
  if (end) {
    const d = new Date(end);
    if (!Number.isNaN(d.getTime())) out.endDate = d;
  }
  return out;
}

function processBarOrPieChartData(
  answers: { value: unknown }[],
  questionType: QuestionType
): Array<{ label: string; value: number }> {
  const counts = new Map<string, number>();
  for (const answer of answers) {
    const labs = distributionLabelsForChart(questionType, answer.value);
    if (labs.length === 0) {
      counts.set("Sem resposta", (counts.get("Sem resposta") ?? 0) + 1);
    } else {
      for (const lab of labs) {
        counts.set(lab, (counts.get(lab) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function processLineChartData(
  answers: Array<{ value: unknown; response: { submittedAt: Date } }>,
  questionType: QuestionType
): Array<{ month: string; value: number }> {
  const byMonth = new Map<string, { sum: number; n: number }>();
  for (const answer of answers) {
    const month = answer.response.submittedAt.toISOString().slice(0, 7);
    if (questionType === "scale" || questionType === "number") {
      const numericValue = Number(answer.value);
      if (Number.isNaN(numericValue)) continue;
      const prev = byMonth.get(month) ?? { sum: 0, n: 0 };
      prev.sum += numericValue;
      prev.n += 1;
      byMonth.set(month, prev);
    } else {
      const prev = byMonth.get(month) ?? { sum: 0, n: 0 };
      prev.n += 1;
      byMonth.set(month, prev);
    }
  }
  return Array.from(byMonth.entries())
    .map(([month, v]) => ({
      month,
      value:
        v.n > 0 && questionType !== "scale" && questionType !== "number"
          ? v.n
          : v.n > 0
            ? v.sum / v.n
            : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chartId: string }> }
) {
  return apiHandler(async () => {
    const { chartId } = await params;
    const url = new URL(req.url);
    const { startDate, endDate } = parseDateFilters(url);

    const chart = await prisma.dashboardChart.findUnique({
      where: { id: chartId },
      include: {
        question: { select: { type: true } },
      },
    });

    if (!chart) {
      throw new Error("Gráfico não encontrado");
    }

    const submittedFilter: Prisma.DateTimeFilter | undefined =
      startDate || endDate
        ? {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        : undefined;

    const qType = chart.question.type as QuestionType;

    if (chart.chartType === "line") {
      const answers = await prisma.answer.findMany({
        where: {
          questionId: chart.questionId,
          response: {
            formId: chart.formId,
            ...(submittedFilter ? { submittedAt: submittedFilter } : {}),
          },
        },
        select: {
          value: true,
          response: { select: { submittedAt: true } },
        },
      });
      if (answers.length === 0) return [];
      return processLineChartData(answers, qType);
    }

    const answers = await prisma.answer.findMany({
      where: {
        questionId: chart.questionId,
        response: {
          formId: chart.formId,
          ...(submittedFilter ? { submittedAt: submittedFilter } : {}),
        },
      },
      select: { value: true },
    });

    if (answers.length === 0) {
      return [];
    }

    if (chart.chartType === "bar" || chart.chartType === "pie") {
      return processBarOrPieChartData(answers, qType);
    }

    return [];
  });
}
