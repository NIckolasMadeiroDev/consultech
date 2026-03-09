import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const r = await prisma.financeReceivable.findUnique({
      where: { id },
      include: { category: { select: { name: true } }, paymentMethod: { select: { name: true } }, cashbox: { select: { name: true } } },
    });
    if (!r) throw new Error("Conta a receber não encontrada.");
    return {
      id: r.id,
      description: r.description,
      amount: Number(r.amount),
      dueDate: r.dueDate.toISOString().slice(0, 10),
      status: r.status,
      receivedAt: r.receivedAt?.toISOString().slice(0, 10) ?? null,
      transactionId: r.transactionId,
      categoryId: r.categoryId ?? "",
      paymentMethodId: r.paymentMethodId ?? "",
      cashboxId: r.cashboxId ?? "",
    };
  });
}

/** Parse optional string from body for update (undefined = don't change). */
function optStrPatch(body: Record<string, unknown>, key: string): string | null | undefined {
  const v = body[key];
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === "string") {
    const s = v.trim();
    return s === "" ? null : s;
  }
  if (typeof v === "number" || typeof v === "boolean") return String(v).trim() || null;
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }
    const rec = await prisma.financeReceivable.findUnique({ where: { id } });
    if (!rec) throw new Error("Conta a receber não encontrada.");
    if (rec.status === "received") {
      throw new Error("Conta já recebida. Não é possível editar.");
    }
    const description =
      body.description === null || body.description === undefined
        ? undefined
        : String(body.description).trim();
    const amountRaw = body.amount;
    const amount =
      amountRaw === null || amountRaw === undefined
        ? undefined
        : Number(amountRaw);
    const dueDateRaw = body.dueDate;
    const dueDate =
      dueDateRaw === null || dueDateRaw === undefined
        ? undefined
        : new Date(String(dueDateRaw) + "T12:00:00.000Z");
    const categoryId = optStrPatch(body, "categoryId");
    const paymentMethodId = optStrPatch(body, "paymentMethodId");
    const cashboxId = optStrPatch(body, "cashboxId");
    if (
      amount !== undefined &&
      (!Number.isFinite(amount) || amount <= 0)
    ) {
      throw new Error("Valor deve ser positivo.");
    }
    const updated = await prisma.financeReceivable.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(dueDate !== undefined && { dueDate }),
        ...(categoryId !== undefined && { categoryId }),
        ...(paymentMethodId !== undefined && { paymentMethodId }),
        ...(cashboxId !== undefined && { cashboxId }),
      },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "receivable.updated",
      entityType: "finance_receivable",
      entityId: id,
      userId: session?.id ?? null,
    });
    return {
      id: updated.id,
      description: updated.description,
      amount: Number(updated.amount),
      dueDate: updated.dueDate.toISOString().slice(0, 10),
      status: updated.status,
    };
  });
}

/** Marcar como recebido: cria transação entry e vincula. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const rec = await prisma.financeReceivable.findUnique({ where: { id }, include: { cashbox: true } });
    if (!rec) throw new Error("Conta a receber não encontrada.");
    if (rec.status === "received") throw new Error("Conta já recebida.");
    const cashboxId = (body.cashboxId && String(body.cashboxId).trim()) || rec.cashboxId;
    if (!cashboxId) throw new Error("Informe o caixa para recebimento.");
    const tx = await prisma.$transaction(async (prismaTx) => {
      const transaction = await prismaTx.transaction.create({
        data: {
          type: "entry",
          amount: rec.amount,
          description: `Recebimento: ${rec.description}`,
          categoryId: rec.categoryId,
          paymentMethodId: rec.paymentMethodId,
          cashboxDestId: cashboxId,
        },
      });
      await prismaTx.financeReceivable.update({
        where: { id },
        data: { status: "received", receivedAt: new Date(), transactionId: transaction.id },
      });
      return transaction;
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "receivable.received",
      entityType: "finance_receivable",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { ok: true, transactionId: tx.id };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const rec = await prisma.financeReceivable.findUnique({ where: { id } });
    if (!rec) throw new Error("Conta a receber não encontrada.");
    if (rec.status === "received") throw new Error("Não é possível excluir conta já recebida.");
    await prisma.financeReceivable.update({ where: { id }, data: { status: "cancelled" } });
    const session = await getSession(_req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "receivable.cancelled",
      entityType: "finance_receivable",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { ok: true };
  });
}
