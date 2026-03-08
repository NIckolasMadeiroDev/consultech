import { PrismaClient } from "@prisma/client";
import type { AuditLog } from "@/core/entities";
import type { CreateAuditLogInput, AuditLogFilters, IAuditLogRepository } from "../audit-log.repository.interface";

function toAuditLogEntity(row: {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  metadata: unknown;
  createdAt: Date;
}): AuditLog {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    userId: row.userId,
    metadata: row.metadata as AuditLog["metadata"],
    createdAt: row.createdAt,
  };
}

export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    const row = await this.prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId ?? null,
        metadata: data.metadata ?? undefined,
      },
    });
    return toAuditLogEntity(row);
  }

  async findMany(filters: AuditLogFilters): Promise<AuditLog[]> {
    const where: {
      entityType?: string;
      entityId?: string;
      userId?: string;
      action?: string;
    } = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 100,
    });
    return rows.map(toAuditLogEntity);
  }
}
