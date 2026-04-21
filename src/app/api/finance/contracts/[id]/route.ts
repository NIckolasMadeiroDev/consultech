import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const contract = await prisma.financeContract.findUnique({
      where: { id },
      include: {
        receivables: {
          orderBy: { dueDate: "asc" },
          select: {
            id: true,
            description: true,
            amount: true,
            dueDate: true,
            status: true,
            receivedAt: true,
          },
        },
      },
    });

    if (!contract) {
      throw new Error("Contrato não encontrado");
    }

    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      clientName: contract.clientName,
      totalValue: Number(contract.totalValue),
      startDate: contract.startDate.toISOString().slice(0, 10),
      endDate: contract.endDate?.toISOString().slice(0, 10) || null,
      status: contract.status,
      description: contract.description,
      receivables: contract.receivables.map((r) => ({
        id: r.id,
        description: r.description,
        amount: Number(r.amount),
        dueDate: r.dueDate.toISOString().slice(0, 10),
        status: r.status,
        receivedAt: r.receivedAt?.toISOString().slice(0, 10) || null,
      })),
    };
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }

    const existing = await prisma.financeContract.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Contrato não encontrado");
    }

    const updateData: Record<string, unknown> = {};

    if (body.contractNumber !== undefined) {
      const contractNumber =
        typeof body.contractNumber === "string"
          ? body.contractNumber.trim()
          : "";
      if (!contractNumber) {
        throw new Error("Número do contrato é obrigatório");
      }
      updateData.contractNumber = contractNumber;
    }

    if (body.clientName !== undefined) {
      updateData.clientName =
        typeof body.clientName === "string"
          ? body.clientName.trim() || null
          : null;
    }

    if (body.totalValue !== undefined) {
      const totalValue = Number(body.totalValue);
      if (!Number.isFinite(totalValue) || totalValue <= 0) {
        throw new Error("Valor total inválido");
      }
      updateData.totalValue = totalValue;
    }

    if (body.startDate !== undefined) {
      const startDate = new Date(body.startDate);
      if (Number.isNaN(startDate.getTime())) {
        throw new Error("Data de início inválida");
      }
      updateData.startDate = startDate;
    }

    if (body.endDate !== undefined) {
      if (body.endDate === null) {
        updateData.endDate = null;
      } else {
        const endDate = new Date(body.endDate);
        if (Number.isNaN(endDate.getTime())) {
          throw new Error("Data de término inválida");
        }
        updateData.endDate = endDate;
      }
    }

    if (body.status !== undefined) {
      if (!["active", "completed", "cancelled"].includes(body.status)) {
        throw new Error("Status inválido");
      }
      updateData.status = body.status;
    }

    if (body.description !== undefined) {
      updateData.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    const updated = await prisma.financeContract.update({
      where: { id },
      data: updateData,
    });

    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "contract.updated",
      entityType: "finance_contract",
      entityId: id,
      userId: session?.id ?? null,
    });

    return {
      id: updated.id,
      contractNumber: updated.contractNumber,
      status: updated.status,
    };
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const existing = await prisma.financeContract.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Contrato não encontrado");
    }

    await prisma.financeContract.delete({ where: { id } });

    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "contract.deleted",
      entityType: "finance_contract",
      entityId: id,
      userId: session?.id ?? null,
    });

    return { ok: true };
  });
}
