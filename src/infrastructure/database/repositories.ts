import { prisma } from "@/infrastructure/database/prisma";
import { PrismaFormRepository } from "@/modules/forms/infrastructure/prisma-form.repository";
import { PrismaQuestionRepository } from "@/modules/forms/infrastructure/prisma-question.repository";
import { PrismaRespondentRepository } from "@/modules/responses/infrastructure/prisma-respondent.repository";
import { PrismaResponseRepository } from "@/modules/responses/infrastructure/prisma-response.repository";
import { PrismaDashboardRepository } from "@/modules/dashboard/infrastructure/prisma-dashboard.repository";
import { PrismaAuditLogRepository } from "@/modules/audit/infrastructure/prisma-audit-log.repository";
import type { IFormRepository } from "@/modules/forms/form.repository.interface";
import type { IQuestionRepository } from "@/modules/forms/question.repository.interface";
import type { IRespondentRepository } from "@/modules/responses/respondent.repository.interface";
import type { IResponseRepository } from "@/modules/responses/response.repository.interface";
import type { IDashboardRepository } from "@/modules/dashboard/dashboard.repository.interface";
import type { IAuditLogRepository } from "@/modules/audit/audit-log.repository.interface";

export function getFormRepository(): IFormRepository {
  return new PrismaFormRepository(prisma);
}

export function getQuestionRepository(): IQuestionRepository {
  return new PrismaQuestionRepository(prisma);
}

export function getRespondentRepository(): IRespondentRepository {
  return new PrismaRespondentRepository(prisma);
}

export function getResponseRepository(): IResponseRepository {
  return new PrismaResponseRepository(prisma);
}

export function getDashboardRepository(): IDashboardRepository {
  return new PrismaDashboardRepository(prisma);
}

export function getAuditLogRepository(): IAuditLogRepository {
  return new PrismaAuditLogRepository(prisma);
}
