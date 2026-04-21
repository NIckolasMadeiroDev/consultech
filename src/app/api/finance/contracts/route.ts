import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth-session";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "active";

    const where = status ? { status } : {};

    const contracts = await prisma.financeContract.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        receivables: {
          select: { status: true, amount: true },
        },
      },
    });

    return contracts.map((c) => ({
      id: c.id,
      contractNumber: c.contractNumber,
      clientName: c.clientName,
      totalValue: Number(c.totalValue),
      startDate: c.startDate.toISOString().slice(0, 10),
      endDate: c.endDate?.toISOString().slice(0, 10) || null,
      status: c.status,
      description: c.description,
      receivablesCount: c.receivables.length,
      pendingAmount: c.receivables
        .filter((r) => r.status === "pending")
        .reduce((sum, r) => sum + Number(r.amount), 0),
      receivedAmount: c.receivables
        .filter((r) => r.status === "received")
        .reduce((sum, r) => sum + Number(r.amount), 0),
    }));
  });
}

async function createInstallmentsForContract(
  contractId: string,
  totalValue: number,
  installments: number,
  categoryId: string | null,
  paymentMethodId: string | null,
  firstDueDate: Date
) {
  const installmentValue = totalValue / installments;
  const receivables = [];

  for (let i = 0; i < installments; i++) {
    const dueDate = new Date(firstDueDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    receivables.push({
      description: `Parcela ${i + 1}/${installments}`,
      amount: installmentValue,
      dueDate,
      status: "pending",
      contractId,
      categoryId,
      paymentMethodId,
    });
  }

  await prisma.financeReceivable.createMany({ data: receivables });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }

    const contractNumber =
      typeof body.contractNumber === "string"
        ? body.contractNumber.trim()
        : "";
    if (!contractNumber) {
      throw new Error("Número do contrato é obrigatório");
    }

    const totalValue = Number(body.totalValue);
    if (!Number.isFinite(totalValue) || totalValue <= 0) {
      throw new Error("Valor total inválido");
    }

    if (!body.startDate) {
      throw new Error("Data de início é obrigatória");
    }

    const startDate = new Date(body.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new Error("Data de início inválida");
    }

    let endDate = null;
    if (body.endDate) {
      endDate = new Date(body.endDate);
      if (Number.isNaN(endDate.getTime())) {
        throw new Error("Data de término inválida");
      }
      if (endDate < startDate) {
        throw new Error("Data de término deve ser posterior à data de início");
      }
    }

    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();

    const contract = await prisma.financeContract.create({
      data: {
        contractNumber,
        clientName:
          typeof body.clientName === "string"
            ? body.clientName.trim() || null
            : null,
        totalValue,
        startDate,
        endDate,
        status: "active",
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : null,
      },
    });

    await auditRepo.create({
      action: "contract.created",
      entityType: "finance_contract",
      entityId: contract.id,
      userId: session?.id ?? null,
    });

    if (body.installments && Number(body.installments) > 0) {
      const installments = Number(body.installments);
      const categoryId =
        typeof body.categoryId === "string" && body.categoryId.trim()
          ? body.categoryId.trim()
          : null;
      const paymentMethodId =
        typeof body.paymentMethodId === "string" && body.paymentMethodId.trim()
          ? body.paymentMethodId.trim()
          : null;
      const firstDueDate = body.firstDueDate
        ? new Date(body.firstDueDate)
        : startDate;

      await createInstallmentsForContract(
        contract.id,
        totalValue,
        installments,
        categoryId,
        paymentMethodId,
        firstDueDate
      );
    }

    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      totalValue: Number(contract.totalValue),
    };
  });
}
