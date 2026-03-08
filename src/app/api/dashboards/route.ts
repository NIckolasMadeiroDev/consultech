import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { createDashboard } from "@/modules/dashboard/create-dashboard";
import { createDashboardSchema } from "@/modules/dashboard/dashboard.schema";
import { dashboardListDTO, dashboardDTO } from "@/modules/dashboard/dashboard.dto";
import { getDashboardRepository } from "@/infrastructure/database/repositories";
import { getCreatedBy } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const createdBy =
      url.searchParams.get("createdBy") ??
      (await getCreatedBy(req));
    const repo = getDashboardRepository();
    const list = await repo.findByCreatedBy(createdBy);
    return list.map(dashboardListDTO);
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json();
    const data = createDashboardSchema.parse(body);
    const createdBy = await getCreatedBy(req);
    const repo = getDashboardRepository();
    const dashboard = await createDashboard(
      { title: data.title, formIds: data.formIds },
      createdBy,
      repo
    );
    return dashboardDTO(dashboard);
  });
}
