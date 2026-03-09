import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function GET(_req: NextRequest) {
  return apiHandler(async () => {
    const rows = await prisma.financeCategory.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { id: true, name: true, type: true, parentId: true },
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      parentId: c.parentId,
    }));
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new Error("Corpo inválido");
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new Error("Nome é obrigatório.");
    const type = body.type === "entry" || body.type === "exit" ? body.type : "exit";
    const parentId = body.parentId && String(body.parentId).trim() ? String(body.parentId).trim() : null;
    const created = await prisma.financeCategory.create({
      data: { name, type, parentId },
    });
    const session = await getSession(req);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "category.created",
      entityType: "finance_category",
      entityId: created.id,
      userId: session?.id ?? null,
    });
    return { id: created.id, name: created.name, type: created.type, parentId: created.parentId };
  });
}
