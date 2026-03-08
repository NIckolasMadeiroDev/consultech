import type { CreateDashboardInput } from "./dashboard.schema";
import type { IDashboardRepository } from "./dashboard.repository.interface";

export async function createDashboard(
  data: CreateDashboardInput,
  createdBy: string,
  dashboardRepository: IDashboardRepository
) {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Title required");
  }
  if (!data.formIds || data.formIds.length === 0) {
    throw new Error("At least one form required");
  }
  return dashboardRepository.create({
    title: data.title.trim(),
    formIds: data.formIds,
    createdBy,
  });
}
