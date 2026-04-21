import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;

    const respondent = await prisma.respondent.findUnique({
      where: { id },
    });

    if (!respondent) {
      throw new Error("Membro não encontrado");
    }

    // Get responses grouped by month
    const responses = await prisma.response.findMany({
      where: { respondentId: id },
      select: { submittedAt: true },
      orderBy: { submittedAt: "asc" },
    });

    // Group by month
    const byMonth = new Map<string, number>();

    responses.forEach((response) => {
      const monthKey = response.submittedAt.toISOString().slice(0, 7); // YYYY-MM
      byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + 1);
    });

    // Fill in missing months for the last 12 months
    const result = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const count = byMonth.get(monthKey) || 0;

      result.push({
        month: monthKey,
        count,
      });
    }

    return result;
  });
}
