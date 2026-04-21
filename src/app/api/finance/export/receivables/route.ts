import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: { status?: string } = {};
    if (status && ["pending", "received", "overdue", "cancelled"].includes(status)) {
      where.status = status;
    }

    const receivables = await prisma.financeReceivable.findMany({
      where,
      include: {
        category: { select: { name: true } },
        paymentMethod: { select: { name: true } },
        contract: { select: { contractNumber: true, clientName: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    const data = receivables.map((r) => ({
      id: r.id,
      description: r.description,
      amount: Number(r.amount),
      dueDate: r.dueDate.toISOString().slice(0, 10),
      status: r.status,
      statusName:
        r.status === "pending"
          ? "Pendente"
          : r.status === "received"
          ? "Recebido"
          : r.status === "overdue"
          ? "Atrasado"
          : "Cancelado",
      category: r.category?.name || "-",
      paymentMethod: r.paymentMethod?.name || "-",
      contract: r.contract ? `${r.contract.contractNumber} - ${r.contract.clientName || ""}` : "-",
      receivedAt: r.receivedAt ? r.receivedAt.toISOString().slice(0, 10) : "-",
      createdAt: r.createdAt.toISOString(),
    }));

    return data;
  });
}
