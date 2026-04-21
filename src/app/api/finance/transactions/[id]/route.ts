import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { validateTransaction } from "@/domain/finance/validateTransaction";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

const TRANSACTION_TYPES = ["entry", "exit", "transfer", "withdraw", "supply"] as const;

function parseBody(body: unknown) {
  if (body === null || typeof body !== "object") {
    throw new TypeError("Corpo inválido");
  }
  const o = body as Record<string, unknown>;
  const type = o.type;
  if (typeof type !== "string" || !TRANSACTION_TYPES.includes(type as (typeof TRANSACTION_TYPES)[number])) {
    throw new TypeError("Tipo de movimentação inválido");
  }
  const amount = Number(o.amount);
  if (!Number.isFinite(amount)) {
    throw new TypeError("Valor inválido");
  }
  const toStr = (v: unknown): string | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return null;
  };
  const toOptStr = (v: unknown): string | null => {
    const s = toStr(v);
    return s === "" ? null : s;
  };
  return {
    type: type as (typeof TRANSACTION_TYPES)[number],
    amount,
    description: toStr(o.description),
    categoryId: toOptStr(o.categoryId),
    paymentMethodId: toOptStr(o.paymentMethodId),
    cashboxOriginId: toOptStr(o.cashboxOriginId),
    cashboxDestId: toOptStr(o.cashboxDestId),
    movementAt: toOptStr(o.movementAt),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const t = await prisma.transaction.findUnique({
      where: { id },
      include: { category: { select: { name: true } } },
    });
    if (!t) throw new Error("Movimentação não encontrada.");
    return {
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      description: t.description ?? "",
      categoryId: t.categoryId ?? "",
      paymentMethodId: t.paymentMethodId ?? "",
      cashboxOriginId: t.cashboxOriginId ?? "",
      cashboxDestId: t.cashboxDestId ?? "",
      movementAt: t.movementAt.toISOString().slice(0, 10),
    };
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const data = parseBody(body);
    const errors = validateTransaction({
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      paymentMethodId: data.paymentMethodId,
      cashboxOriginId: data.cashboxOriginId,
      cashboxDestId: data.cashboxDestId,
    });
    if (errors.length > 0) {
      throw new Error(errors.map((e) => `${e.field}: ${e.message}`).join("; "));
    }
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) throw new Error("Movimentação não encontrada.");

    let movementAt = existing.movementAt;
    if (data.movementAt) {
      movementAt = new Date(data.movementAt + "T00:00:00.000Z");
      if (movementAt > new Date()) {
        throw new Error("Data da movimentação não pode ser futura");
      }
      if (Number.isNaN(movementAt.getTime())) {
        throw new Error("Data da movimentação inválida");
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        categoryId: data.categoryId || null,
        paymentMethodId: data.paymentMethodId || null,
        cashboxOriginId: data.cashboxOriginId || null,
        cashboxDestId: data.cashboxDestId || null,
        movementAt,
      },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "transaction.updated",
      entityType: "finance_transaction",
      entityId: id,
      userId: session?.id ?? null,
    });
    return {
      id: updated.id,
      type: updated.type,
      amount: Number(updated.amount),
      movementAt: updated.movementAt.toISOString(),
    };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) throw new Error("Movimentação não encontrada.");
    await prisma.transaction.delete({ where: { id } });
    const session = await getSession(_req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "transaction.deleted",
      entityType: "finance_transaction",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { ok: true };
  });
}
