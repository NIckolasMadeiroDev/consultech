import { PrismaClient } from "@prisma/client";
import type { Question } from "@/core/entities";
import type { IQuestionRepository } from "../question.repository.interface";

function toQuestionEntity(row: {
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
}): Question {
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
  };
}

export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMany(questions: Array<Omit<Question, "id">>): Promise<Question[]> {
    const created = await this.prisma.question.createManyAndReturn({
      data: questions.map((q) => ({
        formId: q.formId,
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
        data: {
          type: q.type,
          text: q.text,
          required: q.required,
          orderIndex: q.orderIndex,
          options: q.options,
          scaleMin: q.scaleMin,
          scaleMax: q.scaleMax,
          conditionQuestionId: q.conditionQuestionId ?? null,
          conditionOperator: q.conditionOperator ?? null,
          conditionValue: q.conditionValue ?? undefined,
        },
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
