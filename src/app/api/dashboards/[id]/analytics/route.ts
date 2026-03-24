import type { NextRequest } from "next/server";
import { getDashboardRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";
import { getDashboardAnalytics } from "@/modules/dashboard/get-dashboard-analytics";

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
  const filters = parseFilters(new URL(req.url));
  const analytics = await getDashboardAnalytics(dashboard.formIds, filters);
  return Response.json(analytics);
}
