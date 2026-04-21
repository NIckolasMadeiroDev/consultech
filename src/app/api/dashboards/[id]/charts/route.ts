import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id: dashboardId } = await params;

    const charts = await prisma.dashboardChart.findMany({
      where: { dashboardId },
      include: {
        form: { select: { id: true, title: true } },
        question: { select: { id: true, text: true, type: true } },
      },
      orderBy: { displayOrder: "asc" },
    });

    return charts.map((chart) => ({
      id: chart.id,
      chartType: chart.chartType,
      title: chart.title,
      displayOrder: chart.displayOrder,
      form: {
        id: chart.form.id,
        title: chart.form.title,
      },
      question: {
        id: chart.question.id,
        text: chart.question.text,
        type: chart.question.type,
      },
      createdAt: chart.createdAt.toISOString(),
    }));
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session) {
      throw new Error("Não autorizado");
    }

    const { id: dashboardId } = await params;
    const body = await req.json().catch(() => ({}));

    // Validate dashboard exists
    const dashboard = await prisma.dashboard.findUnique({
      where: { id: dashboardId },
    });

    if (!dashboard) {
      throw new Error("Dashboard não encontrado");
    }

    // Validate inputs
    if (!body.formId || !body.questionId) {
      throw new Error("Form e questão são obrigatórios");
    }

    if (!body.chartType || !["bar", "line", "pie"].includes(body.chartType)) {
      throw new Error("Tipo de gráfico inválido (bar, line, pie)");
    }

    if (!body.title?.trim()) {
      throw new Error("Título é obrigatório");
    }

    // Validate form and question exist
    const form = await prisma.form.findUnique({
      where: { id: body.formId },
    });

    if (!form) {
      throw new Error("Formulário não encontrado");
    }

    const question = await prisma.question.findUnique({
      where: { id: body.questionId, formId: body.formId },
    });

    if (!question) {
      throw new Error("Questão não encontrada ou não pertence ao formulário");
    }

    // Get next display order
    const lastChart = await prisma.dashboardChart.findFirst({
      where: { dashboardId },
      orderBy: { displayOrder: "desc" },
    });

    const displayOrder = (lastChart?.displayOrder || 0) + 1;

    // Create chart
    const chart = await prisma.dashboardChart.create({
      data: {
        dashboardId,
        formId: body.formId,
        questionId: body.questionId,
        chartType: body.chartType,
        title: body.title.trim(),
        displayOrder,
      },
      include: {
        form: { select: { id: true, title: true } },
        question: { select: { id: true, text: true, type: true } },
      },
    });

    return {
      id: chart.id,
      chartType: chart.chartType,
      title: chart.title,
      displayOrder: chart.displayOrder,
      form: {
        id: chart.form.id,
        title: chart.form.title,
      },
      question: {
        id: chart.question.id,
        text: chart.question.text,
        type: chart.question.type,
      },
      createdAt: chart.createdAt.toISOString(),
    };
  });
}
