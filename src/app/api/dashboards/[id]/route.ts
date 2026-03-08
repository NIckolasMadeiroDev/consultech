import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateDashboardSchema } from "@/modules/dashboard/dashboard.schema";
import { dashboardDTO } from "@/modules/dashboard/dashboard.dto";
import { getDashboardRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

async function ensureDashboardOwner(req: NextRequest, dashboardId: string) {
  const session = await getSession(req);
  if (!session?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const repo = getDashboardRepository();
  const dashboard = await repo.findById(dashboardId);
  if (!dashboard) {
    return null;
  }
  if (dashboard.createdBy !== session.id) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }
  return dashboard;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const auth = await ensureDashboardOwner(req, id);
  if (auth instanceof Response) return auth;
  if (!auth) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }
  return Response.json(dashboardDTO(auth));
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const auth = await ensureDashboardOwner(req, id);
  if (auth instanceof Response) return auth;
  if (!auth) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }
  return apiHandler(async () => {
    const body = await req.json();
    const data = updateDashboardSchema.parse(body);
    const repo = getDashboardRepository();
    const updated = await repo.update(id, {
      title: data.title,
      formIds: data.formIds,
    });
    if (!updated) {
      throw new Error("Dashboard not found");
    }
    return dashboardDTO(updated);
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const auth = await ensureDashboardOwner(req, id);
    if (auth instanceof Response) return auth;
    if (!auth) {
      return Response.json({ error: "Dashboard not found" }, { status: 404 });
    }
    const repo = getDashboardRepository();
    const deleted = await repo.delete(id);
    if (!deleted) {
      return Response.json({ error: "Dashboard not found" }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
