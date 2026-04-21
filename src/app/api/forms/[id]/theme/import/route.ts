import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiHandler } from "@/lib/api-handler";
import { getSession } from "@/lib/auth-session";
import { getFormRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { updateForm } from "@/modules/forms/update-form";
import { formDTO } from "@/modules/forms/form.dto";
import { parseFormThemeFromJson } from "@/modules/forms/merge-form-theme";

const importBodySchema = z
  .object({
    version: z.number().optional(),
    theme: z.unknown(),
    formId: z.string().optional(),
  })
  .strict();

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session) {
      throw new Error("Unauthorized");
    }
    const { id } = context.params;
    const raw = await req.json();
    const parsed = importBodySchema.parse(raw);
    const nextTheme = parseFormThemeFromJson(parsed.theme);
    const formRepo = getFormRepository();
    const updated = await updateForm(id, { theme: nextTheme }, formRepo);
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.theme.imported",
      entityType: "form",
      entityId: id,
      userId: session.id,
    });
    return formDTO(updated);
  });
}
