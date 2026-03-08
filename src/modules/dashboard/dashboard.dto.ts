import type { Dashboard } from "@/core/entities";

export function dashboardDTO(dashboard: Dashboard) {
  return {
    id: dashboard.id,
    title: dashboard.title,
    createdBy: dashboard.createdBy,
    createdAt: dashboard.createdAt,
    updatedAt: dashboard.updatedAt,
    formIds: dashboard.formIds,
  };
}

export function dashboardListDTO(dashboard: Dashboard) {
  return {
    id: dashboard.id,
    title: dashboard.title,
    createdAt: dashboard.createdAt,
    formIds: dashboard.formIds,
  };
}

export type DashboardDTO = ReturnType<typeof dashboardDTO>;
export type DashboardListDTO = ReturnType<typeof dashboardListDTO>;
