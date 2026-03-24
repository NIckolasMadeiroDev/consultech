import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import {
  getDashboardRepository,
  getFormRepository,
  getResponseRepository,
} from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

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
  const { id: dashboardId } = context.params;
  const session = await getSession(req);
  if (!session?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dashboardRepo = getDashboardRepository();
  const dashboard = await dashboardRepo.findById(dashboardId);
  if (!dashboard) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }
  if (dashboard.createdBy !== session.id) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }
  return apiHandler(async () => {
    const filters = parseFilters(new URL(req.url));
    const formRepo = getFormRepository();
    const responseRepo = getResponseRepository();
    const forms = await Promise.all(
      dashboard.formIds.map(async (formId) => {
        const [form, summary] = await Promise.all([
          formRepo.findById(formId).catch(() => null),
          responseRepo.getSummaryByFormId(formId, filters),
        ]);
        return {
          formId,
          title: form?.title ?? formId,
          count: summary.count,
          lastSubmittedAt: summary.lastSubmittedAt?.toISOString() ?? null,
        };
      })
    );
    const totalResponses = forms.reduce((acc, f) => acc + f.count, 0);
    return {
      formIds: dashboard.formIds,
      forms,
      totalResponses,
    };
  });
}
