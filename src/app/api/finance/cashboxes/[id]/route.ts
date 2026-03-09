import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { calculateCashboxBalance } from "@/domain/finance/calculateBalance";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

type TxForBalance = {
  type: string;
  amount: unknown;
  cashboxOriginId: string | null;
  cashboxDestId: string | null;
};

function toTx(t: TxForBalance) {
  return {
    type: t.type as "entry" | "exit" | "transfer" | "withdraw" | "supply",
    amount: Number(t.amount),
    cashboxOriginId: t.cashboxOriginId,
    cashboxDestId: t.cashboxDestId,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const cashbox = await prisma.financeCashbox.findUnique({
      where: { id },
      select: { id: true, name: true, description: true, isActive: true },
    });
    if (!cashbox) throw new Error("Caixa não encontrado.");
    const transactions = await prisma.transaction.findMany({
      select: {
        type: true,
        amount: true,
        cashboxOriginId: true,
        cashboxDestId: true,
      },
    });
    const balance = calculateCashboxBalance(id, transactions.map(toTx));
    return {
      id: cashbox.id,
      name: cashbox.name,
      description: cashbox.description ?? null,
      isActive: cashbox.isActive,
      balance,
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
    if (body === null || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }
    const existing = await prisma.financeCashbox.findUnique({ where: { id } });
    if (!existing) throw new Error("Caixa não encontrado.");
    const name =
      body.name === null || body.name === undefined ? undefined : String(body.name).trim();
    const description =
      body.description === undefined
        ? undefined
        : (String(body.description).trim() || null);
    const isActive =
      body.isActive === undefined ? undefined : Boolean(body.isActive);
    const updated = await prisma.financeCashbox.update({
      where: { id },
      data: { ...(name !== undefined && { name }), ...(description !== undefined && { description }), ...(isActive !== undefined && { isActive }) },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "cashbox.updated",
      entityType: "finance_cashbox",
      entityId: id,
      userId: session?.id ?? null,
    });
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description ?? null,
      isActive: updated.isActive,
    };
  });
}
