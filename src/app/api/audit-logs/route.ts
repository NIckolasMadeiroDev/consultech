import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getAuditLogRepository } from "@/infrastructure/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const entityType = url.searchParams.get("entityType") ?? undefined;
    const entityId = url.searchParams.get("entityId") ?? undefined;
    const userId = url.searchParams.get("userId") ?? undefined;
    const action = url.searchParams.get("action") ?? undefined;
    const limit = url.searchParams.get("limit");
    const auditRepo = getAuditLogRepository();
    const logs = await auditRepo.findMany({
      entityType,
      entityId,
      userId,
      action,
      limit: limit ? Number.parseInt(limit, 10) : 100,
    });
    return logs;
  });
}
