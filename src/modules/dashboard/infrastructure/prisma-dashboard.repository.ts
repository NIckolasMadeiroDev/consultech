import { PrismaClient } from "@prisma/client";
import type { Dashboard } from "@/core/entities";
import type { CreateDashboardInput, UpdateDashboardData, IDashboardRepository } from "../dashboard.repository.interface";

function toDashboardEntity(row: {
  id: string;
  title: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  formIds: unknown;
}): Dashboard {
  const formIds = row.formIds;
  return {
    id: row.id,
    title: row.title,
    createdBy: row.createdBy ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    formIds: Array.isArray(formIds) ? (formIds as string[]) : [],
  };
}

export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateDashboardInput): Promise<Dashboard> {
    const row = await this.prisma.dashboard.create({
      data: {
        title: data.title,
        createdBy: data.createdBy || null,
        formIds: data.formIds,
      },
    });
    return toDashboardEntity(row);
  }

  async findById(id: string): Promise<Dashboard | null> {
    const row = await this.prisma.dashboard.findUnique({ where: { id } });
    return row ? toDashboardEntity(row) : null;
  }

  async findByCreatedBy(createdBy: string): Promise<Dashboard[]> {
    const rows = await this.prisma.dashboard.findMany({
      where: { createdBy },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDashboardEntity);
  }

  async update(id: string, data: UpdateDashboardData): Promise<Dashboard | null> {
    try {
      const updateData: { title?: string; formIds?: string[] } = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.formIds !== undefined) updateData.formIds = data.formIds;
      const row = await this.prisma.dashboard.update({
        where: { id },
        data: updateData,
      });
      return toDashboardEntity(row);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.dashboard.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
