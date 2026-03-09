import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      throw new Error("Corpo inválido");
    }
    const existing = await prisma.financePaymentMethod.findUnique({ where: { id } });
    if (!existing) throw new Error("Forma de pagamento não encontrada.");
    const nameRaw =
      body.name === null || body.name === undefined ? undefined : String(body.name).trim();
    if (nameRaw === undefined) {
      // keep current name
    } else if (nameRaw === "") {
      throw new Error("Nome é obrigatório.");
    }
    const updated = await prisma.financePaymentMethod.update({
      where: { id },
      data: nameRaw === undefined ? {} : { name: nameRaw },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "payment_method.updated",
      entityType: "finance_payment_method",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { id: updated.id, name: updated.name };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const existing = await prisma.financePaymentMethod.findUnique({
      where: { id },
      include: { _count: { select: { transactions: true } } },
    });
    if (!existing) throw new Error("Forma de pagamento não encontrada.");
    if (existing._count.transactions > 0) {
      throw new Error("Não é possível excluir forma de pagamento usada em movimentações.");
    }
    await prisma.financePaymentMethod.delete({ where: { id } });
    const session = await getSession(_req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "payment_method.deleted",
      entityType: "finance_payment_method",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { ok: true };
  });
}
