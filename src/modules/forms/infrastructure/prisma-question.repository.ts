import { PrismaClient } from "@prisma/client";
import type { Question } from "@/core/entities";
import type { FileUploadRules } from "@/types/file-upload-rules";
import type { IQuestionRepository } from "../question.repository.interface";

function parseFileUploadRules(raw: unknown): FileUploadRules | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const maxFileBytes = o.maxFileBytes;
  const maxFiles = o.maxFiles;
  const allowedExtensions = o.allowedExtensions;
  const required = o.required;
  if (
    typeof maxFileBytes !== "number" ||
    typeof maxFiles !== "number" ||
    !Array.isArray(allowedExtensions) ||
    typeof required !== "boolean"
  ) {
    return undefined;
  }
  const ext = allowedExtensions.filter((x): x is string => typeof x === "string");
  return {
    maxFileBytes,
    maxFiles,
    allowedExtensions: ext,
    required,
  };
}

export function toQuestionEntity(row: {
  id: string;
  formId: string;
  type: string;
  text: string;
  required: boolean;
  orderIndex: number;
  options: unknown;
  scaleMin: number | null;
  scaleMax: number | null;
  conditionQuestionId: string | null;
  conditionOperator: string | null;
  conditionValue: unknown;
  sectionTitle: string | null;
  sectionDescription: string | null;
  helpText: string | null;
  placeholder: string | null;
  contentHtml: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  imageAlt: string | null;
  separatorStyle: string | null;
  fileDownloadUrl: string | null;
  fileDownloadLabel: string | null;
  fileDownloadMime: string | null;
  fileUploadRules: unknown;
  customIcon: string | null;
}): Question {
  const rules = parseFileUploadRules(row.fileUploadRules);
  return {
    id: row.id,
    formId: row.formId,
    type: row.type as Question["type"],
    text: row.text,
    required: row.required,
    orderIndex: row.orderIndex,
    options: Array.isArray(row.options) ? (row.options as string[]) : undefined,
    scaleMin: row.scaleMin ?? undefined,
    scaleMax: row.scaleMax ?? undefined,
    conditionQuestionId: row.conditionQuestionId ?? undefined,
    conditionOperator: row.conditionOperator ?? undefined,
    conditionValue: row.conditionValue,
    sectionTitle: row.sectionTitle ?? undefined,
    sectionDescription: row.sectionDescription ?? undefined,
    helpText: row.helpText ?? undefined,
    placeholder: row.placeholder ?? undefined,
    contentHtml: row.contentHtml ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    videoUrl: row.videoUrl ?? undefined,
    imageAlt: row.imageAlt ?? undefined,
    separatorStyle: row.separatorStyle ?? undefined,
    fileDownloadUrl: row.fileDownloadUrl ?? undefined,
    fileDownloadLabel: row.fileDownloadLabel ?? undefined,
    fileDownloadMime: row.fileDownloadMime ?? undefined,
    fileUploadRules: rules,
    customIcon: row.customIcon ?? undefined,
  };
}

function questionFieldsForDb(
  q: Pick<Question, "type" | "text" | "required" | "orderIndex"> &
    Partial<Omit<Question, "id" | "formId" | "type" | "text" | "required" | "orderIndex">>
) {
  return {
    type: q.type,
    text: q.text,
    required: q.required,
    orderIndex: q.orderIndex,
    options: q.options ?? undefined,
    scaleMin: q.scaleMin,
    scaleMax: q.scaleMax,
    conditionQuestionId: q.conditionQuestionId ?? null,
    conditionOperator: q.conditionOperator ?? null,
    conditionValue: q.conditionValue ?? undefined,
    sectionTitle: q.sectionTitle ?? null,
    sectionDescription: q.sectionDescription ?? null,
    helpText: q.helpText ?? null,
    placeholder: q.placeholder ?? null,
    contentHtml: q.contentHtml ?? null,
    imageUrl: q.imageUrl ?? null,
    videoUrl: q.videoUrl ?? null,
    imageAlt: q.imageAlt ?? null,
    separatorStyle: q.separatorStyle ?? null,
    fileDownloadUrl: q.fileDownloadUrl ?? null,
    fileDownloadLabel: q.fileDownloadLabel ?? null,
    fileDownloadMime: q.fileDownloadMime ?? null,
    fileUploadRules: q.fileUploadRules ?? undefined,
    customIcon: q.customIcon ?? null,
  };
}

export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMany(questions: Array<Omit<Question, "id">>): Promise<Question[]> {
    const created = await this.prisma.question.createManyAndReturn({
      data: questions.map((q) => ({
        formId: q.formId,
        ...questionFieldsForDb(q),
      })),
    });
    return created.map(toQuestionEntity);
  }

  async findByFormId(formId: string): Promise<Question[]> {
    const rows = await this.prisma.question.findMany({
      where: { formId },
      orderBy: { orderIndex: "asc" },
    });
    return rows.map(toQuestionEntity);
  }

  async updateMany(
    formId: string,
    questions: Array<Partial<Question> & { id: string }>
  ): Promise<Question[]> {
    const result: Question[] = [];
    for (const q of questions) {
      const row = await this.prisma.question.updateMany({
        where: { id: q.id, formId },
        data: questionFieldsForDb(
          q as Pick<Question, "type" | "text" | "required" | "orderIndex"> &
            Partial<Omit<Question, "id" | "formId" | "type" | "text" | "required" | "orderIndex">>
        ),
      });
      if (row.count > 0) {
        const updated = await this.prisma.question.findUniqueOrThrow({
          where: { id: q.id },
        });
        result.push(toQuestionEntity(updated));
      }
    }
    return result;
  }

  async deleteByFormId(formId: string): Promise<void> {
    await this.prisma.question.deleteMany({ where: { formId } });
  }

  async deleteManyIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.prisma.question.deleteMany({ where: { id: { in: ids } } });
  }
}
