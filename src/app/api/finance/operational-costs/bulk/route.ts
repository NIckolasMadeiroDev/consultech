import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }

    const year = Number(body.year);
    const annualCost = Number(body.annualCost);

    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      throw new Error("Ano inválido");
    }

    if (!Number.isFinite(annualCost) || annualCost < 0) {
      throw new Error("Custo anual inválido");
    }

    const monthlyCost = annualCost / 12;
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();

    const operations = [];
    for (let month = 1; month <= 12; month++) {
      operations.push(
        prisma.financeOperationalCost.upsert({
          where: { year_month: { year, month } },
          update: {
            predictedCost: monthlyCost,
            description: `Custo mensal previsto (1/12 do custo anual)`,
          },
          create: {
            year,
            month,
            predictedCost: monthlyCost,
            description: `Custo mensal previsto (1/12 do custo anual)`,
          },
        })
      );
    }

    await Promise.all(operations);

    await auditRepo.create({
      action: "operational_cost.bulk_created",
      entityType: "finance_operational_cost",
      entityId: `${year}`,
      userId: session?.id ?? null,
      metadata: { year, annualCost, monthlyCost },
    });

    return { success: true, monthsCreated: 12, monthlyCost };
  });
}
