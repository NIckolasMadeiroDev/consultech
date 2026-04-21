import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: { status?: string } = {};
    if (status && ["planning", "approved", "in_progress", "completed", "cancelled"].includes(status)) {
      where.status = status;
    }

    const events = await prisma.financeEvent.findMany({
      where,
      include: {
        scenarios: {
          orderBy: { totalCost: "asc" },
        },
      },
      orderBy: { eventDate: "desc" },
    });

    const formatted = events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      eventDate: e.eventDate.toISOString().slice(0, 10),
      status: e.status,
      scenariosCount: e.scenarios.length,
      minCost: e.scenarios.length > 0 ? Number(e.scenarios[0].totalCost) : 0,
      maxCost: e.scenarios.length > 0 ? Number(e.scenarios[e.scenarios.length - 1].totalCost) : 0,
      createdAt: e.createdAt.toISOString(),
    }));

    return formatted;
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const session = await getSession(req);
    const body = await req.json().catch(() => ({}));

    if (!body.name?.trim()) {
      throw new Error("Nome do evento é obrigatório");
    }

    if (!body.eventDate) {
      throw new Error("Data do evento é obrigatória");
    }

    const eventDate = new Date(body.eventDate + "T00:00:00.000Z");
    if (Number.isNaN(eventDate.getTime())) {
      throw new Error("Data do evento inválida");
    }

    const scenarios = Array.isArray(body.scenarios) ? body.scenarios : [];
    
    // Validate scenarios
    for (const scenario of scenarios) {
      if (!scenario.scenarioName?.trim()) {
        throw new Error("Nome do cenário é obrigatório");
      }
      if (!scenario.membersCount || scenario.membersCount <= 0) {
        throw new Error("Número de membros deve ser maior que zero");
      }
      if (!scenario.costPerMember || scenario.costPerMember < 0) {
        throw new Error("Custo por membro não pode ser negativo");
      }
    }

    const event = await prisma.financeEvent.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        eventDate,
        status: body.status || "planning",
        scenarios: {
          create: scenarios.map((s: { scenarioName: string; membersCount: number; costPerMember: number; notes?: string }) => {
            const membersCount = Number(s.membersCount);
            const costPerMember = Number(s.costPerMember);
            const totalCost = membersCount * costPerMember;

            return {
              scenarioName: s.scenarioName.trim(),
              membersCount,
              costPerMember,
              totalCost,
              notes: s.notes?.trim() || null,
            };
          }),
        },
      },
      include: {
        scenarios: true,
      },
    });

    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "event.created",
      entityType: "finance_event",
      entityId: event.id,
      userId: session?.id ?? null,
    });

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      eventDate: event.eventDate.toISOString().slice(0, 10),
      status: event.status,
      scenarios: event.scenarios.map((s) => ({
        id: s.id,
        scenarioName: s.scenarioName,
        membersCount: s.membersCount,
        costPerMember: Number(s.costPerMember),
        totalCost: Number(s.totalCost),
        notes: s.notes,
      })),
      createdAt: event.createdAt.toISOString(),
    };
  });
}
