import { randomUUID } from "node:crypto";
import type { Question } from "@/core/entities";
import type { IQuestionRepository } from "../question.repository.interface";

const store: Map<string, Question> = new Map();

export class InMemoryQuestionRepository implements IQuestionRepository {
  async createMany(questions: Array<Omit<Question, "id">>): Promise<Question[]> {
    const created = questions.map((q) => {
      const question: Question = {
        id: randomUUID(),
        formId: q.formId,
        type: q.type,
        text: q.text,
        required: q.required,
        orderIndex: q.orderIndex,
        options: q.options,
        scaleMin: q.scaleMin,
        scaleMax: q.scaleMax,
      };
      store.set(question.id, question);
      return question;
    });
    return created;
  }

  async findByFormId(formId: string): Promise<Question[]> {
    return Array.from(store.values())
      .filter((q) => q.formId === formId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async updateMany(
    formId: string,
    questions: Array<Partial<Question> & { id: string }>
  ): Promise<Question[]> {
    const result: Question[] = [];
    for (const q of questions) {
      const existing = store.get(q.id);
      if (existing?.formId === formId) {
        const updated = { ...existing, ...q };
        store.set(q.id, updated as Question);
        result.push(updated as Question);
      }
    }
    return result;
  }

  async deleteByFormId(formId: string): Promise<void> {
    for (const [id, q] of store.entries()) {
      if (q.formId === formId) store.delete(id);
    }
  }

  async deleteManyIds(ids: string[]): Promise<void> {
    for (const id of ids) store.delete(id);
  }
}

export function clearQuestionStore(): void {
  store.clear();
}
