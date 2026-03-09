import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const cat = await prisma.financeCategory.findUnique({
      where: { id },
      select: { id: true, name: true, type: true, parentId: true },
    });
    if (!cat) throw new Error("Categoria não encontrada.");
    return { id: cat.id, name: cat.name, type: cat.type, parentId: cat.parentId };
  });
}

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
    const existing = await prisma.financeCategory.findUnique({ where: { id } });
    if (!existing) throw new Error("Categoria não encontrada.");
    const name =
      body.name === null || body.name === undefined ? undefined : String(body.name).trim();
    const type = body.type === "entry" || body.type === "exit" ? body.type : undefined;
    let parentId: string | null | undefined = undefined;
    if (body.parentId !== undefined) {
      const raw = body.parentId;
      parentId =
        raw === null || raw === undefined || String(raw).trim() === ""
          ? null
          : String(raw).trim();
    }
    const updated = await prisma.financeCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(parentId !== undefined && { parentId }),
      },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "category.updated",
      entityType: "finance_category",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { id: updated.id, name: updated.name, type: updated.type, parentId: updated.parentId };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    const existing = await prisma.financeCategory.findUnique({ where: { id }, include: { children: true } });
    if (!existing) throw new Error("Categoria não encontrada.");
    if (existing.children.length > 0) {
      throw new Error("Não é possível excluir categoria com subcategorias. Remova ou mova as subcategorias primeiro.");
    }
    await prisma.financeCategory.delete({ where: { id } });
    const session = await getSession(_req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "category.deleted",
      entityType: "finance_category",
      entityId: id,
      userId: session?.id ?? null,
    });
    return { ok: true };
  });
}
