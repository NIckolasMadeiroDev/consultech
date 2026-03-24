import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function GET() {
  return apiHandler(async () => {
    const rows = await prisma.financePaymentMethod.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return rows.map((p) => ({ id: p.id, name: p.name }));
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new Error("Corpo inválido");
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new Error("Nome é obrigatório.");
    const created = await prisma.financePaymentMethod.create({ data: { name } });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "payment_method.created",
      entityType: "finance_payment_method",
      entityId: created.id,
      userId: session?.id ?? null,
    });
    return { id: created.id, name: created.name };
  });
}
