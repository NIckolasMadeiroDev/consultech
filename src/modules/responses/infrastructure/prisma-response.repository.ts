import { PrismaClient } from "@prisma/client";
import type { Response, Answer } from "@/core/entities";
import type { ResponseFilters } from "@/types";
import type { SubmitResponseInput, IResponseRepository } from "../response.repository.interface";

function toResponseEntity(row: {
  id: string;
  formId: string;
  respondentId: string;
  submittedAt: Date;
}): Response {
  return {
    id: row.id,
    formId: row.formId,
    respondentId: row.respondentId,
    submittedAt: row.submittedAt,
  };
}

function toAnswerEntity(row: {
  id: string;
  responseId: string;
  questionId: string;
  value: unknown;
}): Answer {
  return {
    id: row.id,
    responseId: row.responseId,
    questionId: row.questionId,
    value: row.value as Answer["value"],
  };
}

function buildWhere(
  formId: string,
  filters?: ResponseFilters
): { formId: string; respondentId?: string; submittedAt?: object } {
  const where: { formId: string; respondentId?: string; submittedAt?: object } = {
    formId,
  };
  if (filters?.respondentId) {
    where.respondentId = filters.respondentId;
  }
  if (filters?.startDate ?? filters?.endDate) {
    where.submittedAt = {};
    if (filters.startDate) {
      (where.submittedAt as { gte?: Date }).gte = filters.startDate;
    }
    if (filters.endDate) {
      (where.submittedAt as { lte?: Date }).lte = filters.endDate;
    }
  }
  return where;
}

export class PrismaResponseRepository implements IResponseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: SubmitResponseInput): Promise<Response> {
    const response = await this.prisma.response.create({
      data: {
        formId: data.formId,
        respondentId: data.respondentId,
        answers: {
          create: data.answers.map((a) => ({
            questionId: a.questionId,
            value: a.value as object,
          })),
        },
      },
    });
    return toResponseEntity(response);
  }

  async findById(id: string): Promise<Response | null> {
    const row = await this.prisma.response.findUnique({ where: { id } });
    return row ? toResponseEntity(row) : null;
  }

  async findByFormId(formId: string, filters?: ResponseFilters): Promise<Response[]> {
    const where = buildWhere(formId, filters);
    const rows = await this.prisma.response.findMany({
      where,
      orderBy: { submittedAt: "desc" },
    });
    return rows.map(toResponseEntity);
  }

  async findPageByFormId(
    formId: string,
    opts: { filters?: ResponseFilters; page: number; limit: number }
  ): Promise<{ data: Response[]; total: number }> {
    const where = buildWhere(formId, opts.filters);
    const skip = Math.max(0, (opts.page - 1) * opts.limit);
    const take = Math.min(100, Math.max(1, opts.limit));
    const [total, rows] = await Promise.all([
      this.prisma.response.count({ where }),
      this.prisma.response.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        skip,
        take,
      }),
    ]);
    return { data: rows.map(toResponseEntity), total };
  }

  async getAnswersByResponseId(responseId: string): Promise<Answer[]> {
    const rows = await this.prisma.answer.findMany({
      where: { responseId },
    });
    return rows.map(toAnswerEntity);
  }

  async getSummaryByFormId(
    formId: string,
    filters?: ResponseFilters
  ): Promise<{ count: number; lastSubmittedAt: Date | null }> {
    const where = buildWhere(formId, filters);
    const [count, last] = await Promise.all([
      this.prisma.response.count({ where }),
      this.prisma.response.findFirst({
        where,
        orderBy: { submittedAt: "desc" },
        select: { submittedAt: true },
      }),
    ]);
    return { count, lastSubmittedAt: last?.submittedAt ?? null };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.response.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
