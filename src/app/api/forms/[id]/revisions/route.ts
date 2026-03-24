import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getFormRepository, getFormRevisionRepository } from "@/infrastructure/database/repositories";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id } = context.params;
    const formRepo = getFormRepository();
    const form = await formRepo.findById(id);
    if (!form) {
      throw new Error("Form not found");
    }
    const revisionRepo = getFormRevisionRepository();
    const rows = await revisionRepo.findByFormId(id, 100);
    return rows.map((r) => ({
      id: r.id,
      version: r.version,
      summary: r.summary,
      details: r.details,
      createdAt: r.createdAt.toISOString(),
      editedByName: r.editorName,
    }));
  });
}
