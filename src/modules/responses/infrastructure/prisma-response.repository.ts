import { PrismaClient, type Prisma } from "@prisma/client";
import type { Response, Answer } from "@/core/entities";
import type { ResponseFilters } from "@/types";
import type {
  SubmitResponseInput,
  IResponseRepository,
  ResponseAttachmentRecord,
} from "../response.repository.interface";

function toResponseEntity(row: {
  id: string;
  formId: string;
  respondentId: string | null;
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

export class PrismaResponseRepository implements IResponseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async resolveWhere(
    formId: string,
    filters?: ResponseFilters
  ): Promise<Prisma.ResponseWhereInput> {
    const parts: Prisma.ResponseWhereInput[] = [{ formId }];
    if (filters?.respondentId) {
      parts.push({ respondentId: filters.respondentId });
    }
    if (filters?.startDate ?? filters?.endDate) {
      const submittedAt: { gte?: Date; lte?: Date } = {};
      if (filters.startDate) submittedAt.gte = filters.startDate;
      if (filters.endDate) submittedAt.lte = filters.endDate;
      parts.push({ submittedAt });
    }
    const rs = filters?.respondentSearch?.trim();
    const dept = filters?.department?.trim();
    if (rs) {
      parts.push({
        respondent: {
          OR: [
            { name: { contains: rs, mode: "insensitive" } },
            { email: { contains: rs, mode: "insensitive" } },
            { employeeId: { contains: rs, mode: "insensitive" } },
            { department: { contains: rs, mode: "insensitive" } },
          ],
        },
      });
    }
    if (dept) {
      parts.push({
        respondent: {
          is: { department: { equals: dept, mode: "insensitive" } },
        },
      });
    }
    const av = filters?.answerValue?.trim();
    if (av) {
      const pattern = `%${av}%`;
      const rows = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT DISTINCT r.id
        FROM responses r
        INNER JOIN answers a ON a.response_id = r.id
        WHERE r.form_id = ${formId}::uuid
          AND a.value::text ILIKE ${pattern}
      `;
      const ids = rows.map((r) => r.id);
      parts.push({ id: { in: ids.length > 0 ? ids : [] } });
    }
    if (parts.length === 1) {
      return parts[0] as Prisma.ResponseWhereInput;
    }
    return { AND: parts };
  }

  async create(data: SubmitResponseInput): Promise<Response> {
    const response = await this.prisma.response.create({
      data: {
        formId: data.formId,
        respondentId: data.respondentId,
        submissionMetadata:
          data.submissionMetadata === undefined || data.submissionMetadata === null
            ? undefined
            : (data.submissionMetadata as object),
        answers: {
          create: data.answers.map((a) => ({
            questionId: a.questionId,
            value: a.value as object,
          })),
        },
        attachments:
          data.attachments && data.attachments.length > 0
            ? {
                create: data.attachments.map((a) => ({
                  questionId: a.questionId,
                  storagePath: a.storagePath,
                  publicUrl: a.publicUrl,
                  mimeType: a.mimeType,
                  sizeBytes: BigInt(a.sizeBytes),
                  originalFilename: a.originalFilename,
                })),
              }
            : undefined,
      },
    });
    return toResponseEntity(response);
  }

  async findById(id: string): Promise<Response | null> {
    const row = await this.prisma.response.findUnique({ where: { id } });
    return row ? toResponseEntity(row) : null;
  }

  async findByFormId(formId: string, filters?: ResponseFilters): Promise<Response[]> {
    const where = await this.resolveWhere(formId, filters);
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
    const where = await this.resolveWhere(formId, opts.filters);
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

  async getAttachmentsByResponseId(responseId: string): Promise<ResponseAttachmentRecord[]> {
    const rows = await this.prisma.responseAttachment.findMany({
      where: { responseId },
    });
    return rows.map((r) => ({
      questionId: r.questionId,
      storagePath: r.storagePath,
      publicUrl: r.publicUrl,
      mimeType: r.mimeType,
      sizeBytes: Number(r.sizeBytes),
      originalFilename: r.originalFilename,
    }));
  }

  async getSummaryByFormId(
    formId: string,
    filters?: ResponseFilters
  ): Promise<{ count: number; lastSubmittedAt: Date | null }> {
    const where = await this.resolveWhere(formId, filters);
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

  async findRecentByFormIdWithAnswers(
    formId: string,
    filters: ResponseFilters | undefined,
    limit: number
  ): Promise<Array<{ submittedAt: Date; answers: Array<{ questionId: string; value: unknown }> }>> {
    const where = await this.resolveWhere(formId, filters);
    const take = Math.min(500, Math.max(1, limit));
    const rows = await this.prisma.response.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take,
      select: {
        submittedAt: true,
        answers: { select: { questionId: true, value: true } },
      },
    });
    return rows.map((r) => ({
      submittedAt: r.submittedAt,
      answers: r.answers.map((a) => ({
        questionId: a.questionId,
        value: a.value as unknown,
      })),
    }));
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
