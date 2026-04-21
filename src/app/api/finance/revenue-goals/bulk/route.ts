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
    const annualGoal = Number(body.annualGoal);

    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      throw new Error("Ano inválido");
    }

    if (!Number.isFinite(annualGoal) || annualGoal < 0) {
      throw new Error("Meta anual inválida");
    }

    const monthlyGoal = annualGoal / 12;
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();

    const operations = [];
    for (let month = 1; month <= 12; month++) {
      operations.push(
        prisma.financeRevenueGoal.upsert({
          where: { year_month: { year, month } },
          update: {
            goalValue: monthlyGoal,
            description: `Meta mensal (1/12 da meta anual)`,
          },
          create: {
            year,
            month,
            goalValue: monthlyGoal,
            description: `Meta mensal (1/12 da meta anual)`,
          },
        })
      );
    }

    await Promise.all(operations);

    await auditRepo.create({
      action: "revenue_goal.bulk_created",
      entityType: "finance_revenue_goal",
      entityId: `${year}`,
      userId: session?.id ?? null,
      metadata: { year, annualGoal, monthlyGoal },
    });

    return { success: true, monthsCreated: 12, monthlyGoal };
  });
}
