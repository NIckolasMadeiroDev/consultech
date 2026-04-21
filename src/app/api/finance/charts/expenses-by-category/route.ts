import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const months = Math.min(24, Math.max(1, Number(url.searchParams.get("months") || "6")));

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        type: "exit",
        movementAt: { gte: startDate, lte: endDate },
        categoryId: { not: null },
      },
      include: { category: { select: { name: true } } },
    });

    const byCategory = new Map<string, { name: string; total: number }>();

    transactions.forEach((t) => {
      if (!t.category) return;
      const key = t.category.name;
      if (!byCategory.has(key)) {
        byCategory.set(key, { name: key, total: 0 });
      }
      byCategory.get(key)!.total += Number(t.amount);
    });

    const result = Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((c) => ({
        category: c.name,
        total: Math.round(c.total * 100) / 100,
      }));

    return result;
  });
}
