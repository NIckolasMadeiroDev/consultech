import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

/** Receitas e despesas por categoria no período */
export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const dateFrom = url.searchParams.get("dateFrom")?.trim() || new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const dateTo = url.searchParams.get("dateTo")?.trim() || new Date().toISOString().slice(0, 10);
    const start = new Date(dateFrom + "T00:00:00.000Z");
    const end = new Date(dateTo + "T23:59:59.999Z");

    const transactions = await prisma.transaction.findMany({
      where: {
        movementAt: { gte: start, lte: end },
        categoryId: { not: null },
      },
      include: { category: { select: { id: true, name: true, type: true } } },
    });

    const byCategory = new Map<string, { name: string; type: string; total: number }>();
    for (const t of transactions) {
      if (!t.category) continue;
      const key = t.category.id;
      if (!byCategory.has(key)) byCategory.set(key, { name: t.category.name, type: t.category.type, total: 0 });
      const row = byCategory.get(key)!;
      const amt = Number(t.amount);
      if (t.type === "entry" || t.type === "supply") row.total += amt;
      if (t.type === "exit" || t.type === "withdraw") row.total -= amt;
    }

    const categories = Array.from(byCategory.entries()).map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      type: data.type,
      total: Math.round(data.total * 100) / 100,
    }));

    return { categories, dateFrom, dateTo };
  });
}
