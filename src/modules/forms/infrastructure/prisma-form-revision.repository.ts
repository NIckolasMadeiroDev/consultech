import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type {
  CreateFormRevisionInput,
  FormRevisionRow,
  IFormRevisionRepository,
} from "../form-revision.repository.interface";

function toRow(row: {
  id: string;
  formId: string;
  version: number;
  editedById: string | null;
  summary: string;
  details: unknown;
  createdAt: Date;
  editedBy: { name: string } | null;
}): FormRevisionRow {
  return {
    id: row.id,
    formId: row.formId,
    version: row.version,
    editedById: row.editedById,
    editorName: row.editedBy?.name ?? null,
    summary: row.summary,
    details: row.details,
    createdAt: row.createdAt,
  };
}

export class PrismaFormRevisionRepository implements IFormRevisionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateFormRevisionInput): Promise<FormRevisionRow> {
    const row = await this.prisma.formRevision.create({
      data: {
        formId: data.formId,
        version: data.version,
        editedById: data.editedById,
        summary: data.summary,
        details: data.details === undefined ? undefined : (data.details as Prisma.InputJsonValue),
      },
      include: { editedBy: { select: { name: true } } },
    });
    return toRow(row);
  }

  async findByFormId(formId: string, limit = 80): Promise<FormRevisionRow[]> {
    const rows = await this.prisma.formRevision.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { editedBy: { select: { name: true } } },
    });
    return rows.map(toRow);
  }
}
