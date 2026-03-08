import type { AuditLog } from "@/core/entities";

export interface CreateAuditLogInput {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  limit?: number;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogInput): Promise<AuditLog>;
  findMany(filters: AuditLogFilters): Promise<AuditLog[]>;
}
