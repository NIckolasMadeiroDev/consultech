import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const months = Math.min(24, Math.max(1, Number(url.searchParams.get("months") || "12")));

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        movementAt: { gte: startDate, lte: endDate },
      },
      select: { type: true, amount: true, movementAt: true },
      orderBy: { movementAt: "asc" },
    });

    const byMonth = new Map<string, { entries: number; exits: number }>();

    transactions.forEach((t) => {
      const monthKey = t.movementAt.toISOString().slice(0, 7);
      if (!byMonth.has(monthKey)) {
        byMonth.set(monthKey, { entries: 0, exits: 0 });
      }
      const data = byMonth.get(monthKey)!;
      const amount = Number(t.amount);
      if (t.type === "entry" || t.type === "supply") {
        data.entries += amount;
      } else if (t.type === "exit" || t.type === "withdraw") {
        data.exits += amount;
      }
    });

    const result = Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        entries: Math.round(data.entries * 100) / 100,
        exits: Math.round(data.exits * 100) / 100,
        balance: Math.round((data.entries - data.exits) * 100) / 100,
      }));

    return result;
  });
}
