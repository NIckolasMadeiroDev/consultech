import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { archiveForm } from "@/modules/forms/archive-form";
import { formDTO } from "@/modules/forms/form.dto";
import { getFormRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id } = context.params;
    const formRepo = getFormRepository();
    const updated = await archiveForm(id, formRepo);
    const userId = (await getSession(req))?.id ?? null;
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.archived",
      entityType: "form",
      entityId: id,
      userId,
    });
    return formDTO(updated);
  });
}
