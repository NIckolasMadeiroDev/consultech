import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getFormRepository, getResponseRepository } from "@/infrastructure/database/repositories";

function parseFilters(url: URL): { startDate?: Date; endDate?: Date } | undefined {
  const start = url.searchParams.get("startDate");
  const end = url.searchParams.get("endDate");
  if (!start && !end) return undefined;
  const filters: { startDate?: Date; endDate?: Date } = {};
  if (start) {
    const d = new Date(start);
    if (!Number.isNaN(d.getTime())) filters.startDate = d;
  }
  if (end) {
    const d = new Date(end);
    if (!Number.isNaN(d.getTime())) filters.endDate = d;
  }
  return Object.keys(filters).length > 0 ? filters : undefined;
}

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id: formId } = context.params;
    const formRepo = getFormRepository();
    const form = await formRepo.findById(formId);
    if (!form) {
      throw new Error("Form not found");
    }
    const responseRepo = getResponseRepository();
    const filters = parseFilters(new URL(req.url));
    const summary = await responseRepo.getSummaryByFormId(formId, filters);
    return {
      count: summary.count,
      lastSubmittedAt: summary.lastSubmittedAt?.toISOString() ?? null,
    };
  });
}
