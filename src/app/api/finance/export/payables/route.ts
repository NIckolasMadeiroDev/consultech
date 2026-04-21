import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: any = {};
    if (status && ["pending", "paid", "overdue", "cancelled"].includes(status)) {
      where.status = status;
    }

    const payables = await prisma.financePayable.findMany({
      where,
      include: {
        category: { select: { name: true } },
        paymentMethod: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    const data = payables.map((p) => ({
      id: p.id,
      description: p.description,
      amount: Number(p.amount),
      dueDate: p.dueDate.toISOString().slice(0, 10),
      status: p.status,
      statusName:
        p.status === "pending"
          ? "Pendente"
          : p.status === "paid"
          ? "Pago"
          : p.status === "overdue"
          ? "Atrasado"
          : "Cancelado",
      category: p.category?.name || "-",
      paymentMethod: p.paymentMethod?.name || "-",
      paidAt: p.paidAt ? p.paidAt.toISOString().slice(0, 10) : "-",
      createdAt: p.createdAt.toISOString(),
    }));

    return data;
  });
}
