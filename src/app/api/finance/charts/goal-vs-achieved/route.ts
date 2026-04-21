import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const months = Math.min(12, Math.max(1, Number(url.searchParams.get("months") || "6")));

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthNumbers = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - i);
      monthNumbers.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const [goals, transactions] = await Promise.all([
      prisma.financeRevenueGoal.findMany({
        where: {
          OR: monthNumbers.map((m) => ({ year: m.year, month: m.month })),
        },
      }),
      prisma.transaction.findMany({
        where: {
          movementAt: { gte: startDate, lte: endDate },
          type: { in: ["entry", "supply"] },
        },
        select: { amount: true, movementAt: true },
      }),
    ]);

    const entriesByMonth = new Map<string, number>();
    transactions.forEach((t) => {
      const key = `${t.movementAt.getFullYear()}-${String(t.movementAt.getMonth() + 1).padStart(2, "0")}`;
      entriesByMonth.set(key, (entriesByMonth.get(key) || 0) + Number(t.amount));
    });

    const result = monthNumbers
      .reverse()
      .map((m) => {
        const key = `${m.year}-${String(m.month).padStart(2, "0")}`;
        const goal = goals.find((g) => g.year === m.year && g.month === m.month);
        return {
          month: key,
          goal: goal ? Number(goal.goalValue) : 0,
          achieved: Math.round((entriesByMonth.get(key) || 0) * 100) / 100,
        };
      });

    return result;
  });
}
