import type { Question } from "@/core/entities";

export interface IQuestionRepository {
  createMany(questions: Array<Omit<Question, "id">>): Promise<Question[]>;
  findByFormId(formId: string): Promise<Question[]>;
  updateMany(formId: string, questions: Array<Partial<Question> & { id: string }>): Promise<Question[]>;
  deleteByFormId(formId: string): Promise<void>;
  deleteManyIds(ids: string[]): Promise<void>;
}
