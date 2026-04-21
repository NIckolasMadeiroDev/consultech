import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const type = url.searchParams.get("type");

    const where: any = {};
    if (startDate) where.movementAt = { ...where.movementAt, gte: new Date(startDate + "T00:00:00.000Z") };
    if (endDate) where.movementAt = { ...where.movementAt, lte: new Date(endDate + "T23:59:59.999Z") };
    if (type && ["entry", "exit", "supply", "withdraw"].includes(type)) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: { select: { name: true } },
        paymentMethod: { select: { name: true } },
      },
      orderBy: { movementAt: "desc" },
    });

    const data = transactions.map((t) => ({
      id: t.id,
      description: t.description,
      type: t.type,
      typeName:
        t.type === "entry"
          ? "Entrada"
          : t.type === "exit"
          ? "Saída"
          : t.type === "supply"
          ? "Suprimento"
          : "Retirada",
      amount: Number(t.amount),
      category: t.category?.name || "-",
      paymentMethod: t.paymentMethod?.name || "-",
      movementAt: t.movementAt.toISOString().slice(0, 10),
      createdAt: t.createdAt.toISOString(),
    }));

    return data;
  });
}
