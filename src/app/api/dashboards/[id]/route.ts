import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateDashboardSchema } from "@/modules/dashboard/dashboard.schema";
import { dashboardDTO } from "@/modules/dashboard/dashboard.dto";
import { getDashboardRepository } from "@/infrastructure/database/repositories";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id } = context.params;
    const repo = getDashboardRepository();
    const dashboard = await repo.findById(id);
    if (!dashboard) {
      throw new Error("Dashboard not found");
    }
    return dashboardDTO(dashboard);
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const { id } = context.params;
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
