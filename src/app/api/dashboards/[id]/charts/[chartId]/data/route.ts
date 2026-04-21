import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chartId: string }> }
) {
  return apiHandler(async () => {
    const { chartId } = await params;

    const chart = await prisma.dashboardChart.findUnique({
      where: { id: chartId },
      include: {
        question: { select: { type: true, options: true } },
      },
    });

    if (!chart) {
      throw new Error("Gráfico não encontrado");
    }

    // Get all answers for this question
    const answers = await prisma.answer.findMany({
      where: { questionId: chart.questionId },
      select: { value: true },
    });

    if (answers.length === 0) {
      return [];
    }

    const questionType = chart.question.type;

    // Process data based on chart type and question type
    if (chart.chartType === "bar" || chart.chartType === "pie") {
      return processBarOrPieChartData(answers, questionType, chart.question.options);
    } else if (chart.chartType === "line") {
      return processLineChartData(answers);
    }

    return [];
  });
}

function processBarOrPieChartData(
  answers: { value: any }[],
  questionType: string,
  options: any
): any[] {
  const counts = new Map<string, number>();

  answers.forEach((answer) => {
    let key = String(answer.value || "Sem resposta");

    // Handle multiple choice (array values)
    if (Array.isArray(answer.value)) {
      answer.value.forEach((v: any) => {
        const k = String(v);
        counts.set(k, (counts.get(k) || 0) + 1);
      });
      return;
    }

    counts.set(key, (counts.get(key) || 0) + 1);
  });

  // Convert to array and sort by count
  const result = Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return result;
}

function processLineChartData(answers: { value: any }[]): any[] {
  // Group by month for time series
  const byMonth = new Map<string, number>();

  answers.forEach((answer) => {
    // For line charts, we need numeric values
    const numericValue = Number(answer.value);
    if (Number.isNaN(numericValue)) return;

    // This is a simplified version - in reality, you'd want to group by actual dates
    // For now, just create a simple series
    const month = new Date().toISOString().slice(0, 7);
    byMonth.set(month, (byMonth.get(month) || 0) + numericValue);
  });

  return Array.from(byMonth.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
