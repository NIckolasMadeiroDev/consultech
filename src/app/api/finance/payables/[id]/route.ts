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
    const p = await prisma.financePayable.findUnique({
      where: { id },
      include: { category: { select: { name: true } }, paymentMethod: { select: { name: true } }, cashbox: { select: { name: true } } },
    });
    if (!p) throw new Error("Conta a pagar não encontrada.");
    return {
      id: p.id,
      description: p.description,
      amount: Number(p.amount),
      dueDate: p.dueDate.toISOString().slice(0, 10),
      status: p.status,
      paidAt: p.paidAt?.toISOString().slice(0, 10) ?? null,
      transactionId: p.transactionId,
      categoryId: p.categoryId ?? "",
      paymentMethodId: p.paymentMethodId ?? "",
      cashboxId: p.cashboxId ?? "",
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
    const payable = await prisma.financePayable.findUnique({ where: { id } });
    if (!payable) throw new Error("Conta a pagar não encontrada.");
    if (payable.status === "paid") {
      throw new Error("Conta já paga. Não é possível editar.");
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
    const updated = await prisma.financePayable.update({
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
      action: "payable.updated",
      entityType: "finance_payable",
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

/** Marcar como pago: cria uma transação exit e vincula. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const payable = await prisma.financePayable.findUnique({ where: { id }, include: { cashbox: true } });
    if (!payable) throw new Error("Conta a pagar não encontrada.");
    if (payable.status === "paid") throw new Error("Conta já está paga.");
    const cashboxId = (body.cashboxId && String(body.cashboxId).trim()) || payable.cashboxId;
    if (!cashboxId) throw new Error("Informe o caixa para pagamento.");
    const tx = await prisma.$transaction(async (prismaTx) => {
      const transaction = await prismaTx.transaction.create({
        data: {
          type: "exit",
          amount: payable.amount,
          description: `Pagamento: ${payable.description}`,
          categoryId: payable.categoryId,
          paymentMethodId: payable.paymentMethodId,
          cashboxOriginId: cashboxId,
        },
      });
      await prismaTx.financePayable.update({
        where: { id },
        data: { status: "paid", paidAt: new Date(), transactionId: transaction.id },
      });
      return transaction;
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "payable.paid",
      entityType: "finance_payable",
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
    const payable = await prisma.financePayable.findUnique({ where: { id } });
    if (!payable) throw new Error("Conta a pagar não encontrada.");
    if (payable.status === "paid") throw new Error("Não é possível excluir conta já paga.");
    await prisma.financePayable.update({ where: { id }, data: { status: "cancelled" } });
    const session = await getSession(_req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "payable.cancelled",
      entityType: "finance_payable",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { ok: true };
  });
}
