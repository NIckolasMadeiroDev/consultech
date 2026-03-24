import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

const FINANCE_ENTITY_TYPES = [
  "finance_transaction",
  "finance_cashbox",
  "finance_category",
  "finance_payment_method",
  "finance_payable",
  "finance_receivable",
];

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const limit = Math.min(200, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "50", 10)));
    const rows = await prisma.auditLog.findMany({
      where: { entityType: { in: FINANCE_ENTITY_TYPES } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      userId: r.userId,
      metadata: r.metadata,
      createdAt: r.createdAt.toISOString(),
    }));
  });
}
