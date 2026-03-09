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

export async function GET(_req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(_req.url);
    const all = url.searchParams.get("all") === "1";
    const [cashboxes, transactions] = await Promise.all([
      prisma.financeCashbox.findMany({
        where: all ? undefined : { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, isActive: true },
      }),
      prisma.transaction.findMany({
        select: {
          type: true,
          amount: true,
          cashboxOriginId: true,
          cashboxDestId: true,
        },
      }),
    ]);

    const txList = transactions.map(toTx);

    return cashboxes.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? null,
      balance: calculateCashboxBalance(c.id, txList),
      isActive: c.isActive,
    }));
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new Error("Nome é obrigatório.");
    const description =
      body.description === undefined ? undefined : (String(body.description).trim() || null);
    const created = await prisma.financeCashbox.create({
      data: { name, description: description ?? undefined, isActive: true },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "cashbox.created",
      entityType: "finance_cashbox",
      entityId: created.id,
      userId: session?.id ?? null,
    });
    return {
      id: created.id,
      name: created.name,
      description: created.description ?? null,
      isActive: created.isActive,
    };
  });
}
