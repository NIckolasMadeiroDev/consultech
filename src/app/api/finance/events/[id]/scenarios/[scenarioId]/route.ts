import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth";
import { AuditLogRepository } from "@/repositories/audit-log-repository";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; scenarioId: string }> }
) {
  return apiHandler(async () => {
    const session = await getSession();
    const { scenarioId } = await params;
    const body = await req.json().catch(() => ({}));

    const existing = await prisma.financeEventScenario.findUnique({
      where: { id: scenarioId },
    });

    if (!existing) {
      throw new Error("Cenário não encontrado");
    }

    const data: any = {};

    if (body.scenarioName !== undefined) {
      if (!body.scenarioName?.trim()) {
        throw new Error("Nome do cenário não pode ser vazio");
      }
      data.scenarioName = body.scenarioName.trim();
    }

    if (body.membersCount !== undefined) {
      const count = Number(body.membersCount);
      if (count <= 0) {
        throw new Error("Número de membros deve ser maior que zero");
      }
      data.membersCount = count;
    }

    if (body.costPerMember !== undefined) {
      const cost = Number(body.costPerMember);
      if (cost < 0) {
        throw new Error("Custo por membro não pode ser negativo");
      }
      data.costPerMember = cost;
    }

    if (body.notes !== undefined) {
      data.notes = body.notes?.trim() || null;
    }

    // Recalculate total cost if members or cost per member changed
    const membersCount = data.membersCount ?? existing.membersCount;
    const costPerMember = data.costPerMember ?? Number(existing.costPerMember);
    data.totalCost = membersCount * costPerMember;

    const updated = await prisma.financeEventScenario.update({
      where: { id: scenarioId },
      data,
    });

    await AuditLogRepository.log({
      entityType: "finance_event_scenario",
      entityId: scenarioId,
      action: "UPDATE",
      performedBy: session?.user?.name || "system",
      metadata: { changes: Object.keys(data) },
    });

    return {
      id: updated.id,
      scenarioName: updated.scenarioName,
      membersCount: updated.membersCount,
      costPerMember: Number(updated.costPerMember),
      totalCost: Number(updated.totalCost),
      notes: updated.notes,
      updatedAt: updated.updatedAt.toISOString(),
    };
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; scenarioId: string }> }
) {
  return apiHandler(async () => {
    const session = await getSession();
    const { scenarioId } = await params;

    const existing = await prisma.financeEventScenario.findUnique({
      where: { id: scenarioId },
      select: { scenarioName: true },
    });

    if (!existing) {
      throw new Error("Cenário não encontrado");
    }

    await prisma.financeEventScenario.delete({
      where: { id: scenarioId },
    });

    await AuditLogRepository.log({
      entityType: "finance_event_scenario",
      entityId: scenarioId,
      action: "DELETE",
      performedBy: session?.user?.name || "system",
      metadata: { scenarioName: existing.scenarioName },
    });

    return { success: true, message: "Cenário deletado com sucesso" };
  });
}
