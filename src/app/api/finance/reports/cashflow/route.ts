import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const dateFrom = url.searchParams.get("dateFrom")?.trim() || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const dateTo = url.searchParams.get("dateTo")?.trim() || new Date().toISOString().slice(0, 10);
    const start = new Date(dateFrom + "T00:00:00.000Z");
    const end = new Date(dateTo + "T23:59:59.999Z");

    const transactions = await prisma.transaction.findMany({
      where: { movementAt: { gte: start, lte: end } },
      select: { type: true, amount: true, movementAt: true },
    });

    const byMonth = new Map<string, { entries: number; exits: number }>();
    for (const t of transactions) {
      const key = t.movementAt.toISOString().slice(0, 7);
      if (!byMonth.has(key)) byMonth.set(key, { entries: 0, exits: 0 });
      const row = byMonth.get(key)!;
      const amt = Number(t.amount);
      if (t.type === "entry" || t.type === "supply") row.entries += amt;
      if (t.type === "exit" || t.type === "withdraw") row.exits += amt;
    }

    const months = Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        entries: Math.round(data.entries * 100) / 100,
        exits: Math.round(data.exits * 100) / 100,
        balance: Math.round((data.entries - data.exits) * 100) / 100,
      }));

    return { months, dateFrom, dateTo };
  });
}
