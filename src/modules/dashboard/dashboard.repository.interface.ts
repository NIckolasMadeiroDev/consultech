import type { Dashboard } from "@/core/entities";

export interface CreateDashboardInput {
  title: string;
  createdBy: string;
  formIds: string[];
}

export interface UpdateDashboardData {
  title?: string;
  formIds?: string[];
}

export interface IDashboardRepository {
  create(data: CreateDashboardInput): Promise<Dashboard>;
  findById(id: string): Promise<Dashboard | null>;
  findByCreatedBy(createdBy: string): Promise<Dashboard[]>;
  update(id: string, data: UpdateDashboardData): Promise<Dashboard | null>;
  delete(id: string): Promise<boolean>;
}
