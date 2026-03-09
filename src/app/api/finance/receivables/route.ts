import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status")?.trim();
    const where: { status?: string } = {};
    if (status) where.status = status;
    const rows = await prisma.financeReceivable.findMany({
      where,
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        description: true,
        amount: true,
        dueDate: true,
        status: true,
        receivedAt: true,
        transactionId: true,
        categoryId: true,
        paymentMethodId: true,
        cashboxId: true,
        category: { select: { name: true } },
        paymentMethod: { select: { name: true } },
        cashbox: { select: { name: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      description: r.description,
      amount: Number(r.amount),
      dueDate: r.dueDate.toISOString().slice(0, 10),
      status: r.status,
      receivedAt: r.receivedAt?.toISOString().slice(0, 10) ?? null,
      transactionId: r.transactionId,
      category: r.category?.name ?? null,
      paymentMethod: r.paymentMethod?.name ?? null,
      cashbox: r.cashbox?.name ?? null,
    }));
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new Error("Corpo inválido");
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!description) throw new Error("Descrição é obrigatória.");
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Valor deve ser positivo.");
    const dueDate = body.dueDate ? new Date(body.dueDate + "T12:00:00.000Z") : new Date();
    const categoryId = body.categoryId && String(body.categoryId).trim() ? String(body.categoryId).trim() : null;
    const paymentMethodId = body.paymentMethodId && String(body.paymentMethodId).trim() ? String(body.paymentMethodId).trim() : null;
    const cashboxId = body.cashboxId && String(body.cashboxId).trim() ? String(body.cashboxId).trim() : null;
    const created = await prisma.financeReceivable.create({
      data: { description, amount, dueDate, status: "pending", categoryId, paymentMethodId, cashboxId },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "receivable.created",
      entityType: "finance_receivable",
      entityId: created.id,
      userId: session?.id ?? null,
    });
    return {
      id: created.id,
      description: created.description,
      amount: Number(created.amount),
      dueDate: created.dueDate.toISOString().slice(0, 10),
      status: created.status,
    };
  });
}
