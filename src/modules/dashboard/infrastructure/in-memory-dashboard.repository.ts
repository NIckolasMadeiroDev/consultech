import { randomUUID } from "node:crypto";
import type { Dashboard } from "@/core/entities";
import type { CreateDashboardInput, IDashboardRepository } from "../dashboard.repository.interface";

const store: Map<string, Dashboard> = new Map();

export class InMemoryDashboardRepository implements IDashboardRepository {
  async create(data: CreateDashboardInput): Promise<Dashboard> {
    const now = new Date();
    const dashboard: Dashboard = {
      id: randomUUID(),
      title: data.title,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
      formIds: data.formIds,
    };
    store.set(dashboard.id, dashboard);
    return dashboard;
  }

  async findById(id: string): Promise<Dashboard | null> {
    return store.get(id) ?? null;
  }

  async findByCreatedBy(createdBy: string): Promise<Dashboard[]> {
    return Array.from(store.values()).filter((d) => d.createdBy === createdBy);
  }

  async update(id: string, data: { title?: string; formIds?: string[] }): Promise<Dashboard | null> {
    const existing = store.get(id);
    if (!existing) return null;
    const updated: Dashboard = {
      ...existing,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.formIds !== undefined && { formIds: data.formIds }),
      updatedAt: new Date(),
    };
    store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return store.delete(id);
  }
}

export function clearDashboardStore(): void {
  store.clear();
}
