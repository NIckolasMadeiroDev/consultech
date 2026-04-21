import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    const { id: eventId } = await params;
    const body = await req.json().catch(() => ({}));

    const event = await prisma.financeEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Evento não encontrado");
    }

    if (!body.scenarioName?.trim()) {
      throw new Error("Nome do cenário é obrigatório");
    }

    if (!body.membersCount || body.membersCount <= 0) {
      throw new Error("Número de membros deve ser maior que zero");
    }

    if (body.costPerMember === undefined || body.costPerMember < 0) {
      throw new Error("Custo por membro não pode ser negativo");
    }

    const membersCount = Number(body.membersCount);
    const costPerMember = Number(body.costPerMember);
    const totalCost = membersCount * costPerMember;

    const scenario = await prisma.financeEventScenario.create({
      data: {
        eventId,
        scenarioName: body.scenarioName.trim(),
        membersCount,
        costPerMember,
        totalCost,
        notes: body.notes?.trim() || null,
      },
    });

    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "event_scenario.created",
      entityType: "finance_event_scenario",
      entityId: scenario.id,
      userId: session?.id ?? null,
    });

    return {
      id: scenario.id,
      scenarioName: scenario.scenarioName,
      membersCount: scenario.membersCount,
      costPerMember: Number(scenario.costPerMember),
      totalCost: Number(scenario.totalCost),
      notes: scenario.notes,
      createdAt: scenario.createdAt.toISOString(),
    };
  });
}
