import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { validateTransaction } from "@/domain/finance/validateTransaction";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "20", 10)));
    const type = url.searchParams.get("type")?.trim();
    const cashboxId = url.searchParams.get("cashboxId")?.trim();
    const categoryId = url.searchParams.get("categoryId")?.trim();
    const dateFrom = url.searchParams.get("dateFrom")?.trim();
    const dateTo = url.searchParams.get("dateTo")?.trim();

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (dateFrom || dateTo) {
      where.movementAt = {};
      if (dateFrom) (where.movementAt as { gte?: Date }).gte = new Date(dateFrom + "T00:00:00.000Z");
      if (dateTo) (where.movementAt as { lte?: Date }).lte = new Date(dateTo + "T23:59:59.999Z");
    }
    if (cashboxId) {
      where.OR = [
        { cashboxOriginId: cashboxId },
        { cashboxDestId: cashboxId },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { movementAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { name: true, type: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items: rows.map((t: { id: string; movementAt: Date; description: string | null; category: { name: string; type: string } | null; type: string; amount: unknown }) => ({
        id: t.id,
        date: t.movementAt.toISOString().slice(0, 10),
        description: t.description ?? "—",
        category: t.category?.name ?? "—",
        type: t.type,
        amount: Number(t.amount),
      })),
      total,
      page,
      limit,
    };
  });
}

const TRANSACTION_TYPES = ["entry", "exit", "transfer", "withdraw", "supply"] as const;

type CreateTransactionBody = {
  type: (typeof TRANSACTION_TYPES)[number];
  amount: number;
  description?: string | null;
  categoryId?: string | null;
  paymentMethodId?: string | null;
  cashboxOriginId?: string | null;
  cashboxDestId?: string | null;
};

function parseBody(body: unknown): CreateTransactionBody {
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
  const desc = o.description;
  const catId = o.categoryId;
  const pmId = o.paymentMethodId;
  const origId = o.cashboxOriginId;
  const destId = o.cashboxDestId;
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
    description: toStr(desc),
    categoryId: toOptStr(catId),
    paymentMethodId: toOptStr(pmId),
    cashboxOriginId: toOptStr(origId),
    cashboxDestId: toOptStr(destId),
  };
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
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
      const message = errors.map((e) => `${e.field}: ${e.message}`).join("; ");
      throw new Error(message);
    }

    const created = await prisma.transaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        categoryId: data.categoryId || null,
        paymentMethodId: data.paymentMethodId || null,
        cashboxOriginId: data.cashboxOriginId || null,
        cashboxDestId: data.cashboxDestId || null,
      },
    });

    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "transaction.created",
      entityType: "finance_transaction",
      entityId: created.id,
      userId: session?.id ?? null,
    });

    return {
      id: created.id,
      type: created.type,
      amount: Number(created.amount),
      movementAt: created.movementAt.toISOString(),
    };
  });
}
