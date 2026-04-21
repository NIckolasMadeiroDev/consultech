import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;

    const event = await prisma.financeEvent.findUnique({
      where: { id },
      include: {
        scenarios: {
          orderBy: { totalCost: "asc" },
        },
      },
    });

    if (!event) {
      throw new Error("Evento não encontrado");
    }

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
        createdAt: s.createdAt.toISOString(),
      })),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const existing = await prisma.financeEvent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Evento não encontrado");
    }

    const data: { name?: string; description?: string | null; eventDate?: Date; status?: string } = {};

    if (body.name !== undefined) {
      if (!body.name?.trim()) {
        throw new Error("Nome do evento não pode ser vazio");
      }
      data.name = body.name.trim();
    }

    if (body.description !== undefined) {
      data.description = body.description?.trim() || null;
    }

    if (body.eventDate !== undefined) {
      const eventDate = new Date(body.eventDate + "T00:00:00.000Z");
      if (Number.isNaN(eventDate.getTime())) {
        throw new Error("Data do evento inválida");
      }
      data.eventDate = eventDate;
    }

    if (body.status !== undefined) {
      const validStatuses = ["planning", "approved", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(body.status)) {
        throw new Error("Status inválido");
      }
      data.status = body.status;
    }

    const updated = await prisma.financeEvent.update({
      where: { id },
      data,
      include: {
        scenarios: {
          orderBy: { totalCost: "asc" },
        },
      },
    });

    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "event.updated",
      entityType: "finance_event",
      entityId: id,
      userId: session?.id ?? null,
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      eventDate: updated.eventDate.toISOString().slice(0, 10),
      status: updated.status,
      scenarios: updated.scenarios.map((s) => ({
        id: s.id,
        scenarioName: s.scenarioName,
        membersCount: s.membersCount,
        costPerMember: Number(s.costPerMember),
        totalCost: Number(s.totalCost),
        notes: s.notes,
      })),
      updatedAt: updated.updatedAt.toISOString(),
    };
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    const { id } = await params;

    const existing = await prisma.financeEvent.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!existing) {
      throw new Error("Evento não encontrado");
    }

    await prisma.financeEvent.delete({
      where: { id },
    });

    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "event.deleted",
      entityType: "finance_event",
      entityId: id,
      userId: session?.id ?? null,
    });

    return { success: true, message: "Evento deletado com sucesso" };
  });
}
