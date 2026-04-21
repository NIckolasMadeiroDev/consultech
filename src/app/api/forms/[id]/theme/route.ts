import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSession } from "@/lib/auth-session";
import { getFormRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { updateForm } from "@/modules/forms/update-form";
import { formDTO } from "@/modules/forms/form.dto";
import { patchFormThemePayloadSchema } from "@/modules/forms/form-theme.schema";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session) {
      throw new Error("Unauthorized");
    }
    const { id } = context.params;
    const body = await req.json();
    const parsed = patchFormThemePayloadSchema.parse(body);
    const payload =
      parsed.successPageHtml != null && parsed.successPageHtml.trim() !== ""
        ? { ...parsed, successPageHtml: sanitizeRichHtml(parsed.successPageHtml) }
        : parsed;
    const formRepo = getFormRepository();
    const updated = await updateForm(id, payload, formRepo);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.theme.updated",
      entityType: "form",
      entityId: id,
      userId: session.id,
    });
    return formDTO(updated);
  });
}
