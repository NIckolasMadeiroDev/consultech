import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const year = Number(url.searchParams.get("year") || new Date().getFullYear());
    const month = url.searchParams.get("month") ? Number(url.searchParams.get("month")) : null;

    const where = month ? { year, month } : { year };

    const costs = await prisma.financeOperationalCost.findMany({
      where,
      orderBy: { month: "asc" },
    });

    return costs.map((c) => ({
      id: c.id,
      year: c.year,
      month: c.month,
      predictedCost: Number(c.predictedCost),
      description: c.description,
    }));
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }

    const year = Number(body.year);
    const month = Number(body.month);

    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      throw new Error("Ano inválido");
    }

    if (!Number.isFinite(month) || month < 1 || month > 12) {
      throw new Error("Mês inválido");
    }

    const predictedCost = Number(body.predictedCost);
    if (!Number.isFinite(predictedCost) || predictedCost < 0) {
      throw new Error("Custo previsto inválido");
    }

    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();

    const existing = await prisma.financeOperationalCost.findUnique({
      where: { year_month: { year, month } },
    });

    if (existing) {
      const updated = await prisma.financeOperationalCost.update({
        where: { id: existing.id },
        data: {
          predictedCost,
          description: typeof body.description === "string" ? body.description : null,
        },
      });

      await auditRepo.create({
        action: "operational_cost.updated",
        entityType: "finance_operational_cost",
        entityId: updated.id,
        userId: session?.id ?? null,
      });

      return { id: updated.id, updated: true };
    }

    const created = await prisma.financeOperationalCost.create({
      data: {
        year,
        month,
        predictedCost,
        description: typeof body.description === "string" ? body.description : null,
      },
    });

    await auditRepo.create({
      action: "operational_cost.created",
      entityType: "finance_operational_cost",
      entityId: created.id,
      userId: session?.id ?? null,
    });

    return { id: created.id, created: true };
  });
}
