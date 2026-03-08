import type { Response, Answer } from "@/core/entities";
import type { ResponseFilters } from "@/types";

export interface SubmitResponseInput {
  formId: string;
  respondentId: string;
  answers: Array<{ questionId: string; value: string | number | boolean | string[] }>;
}

export interface IResponseRepository {
  create(data: SubmitResponseInput): Promise<Response>;
  findById(id: string): Promise<Response | null>;
  findByFormId(formId: string, filters?: ResponseFilters): Promise<Response[]>;
  findPageByFormId(
    formId: string,
    opts: { filters?: ResponseFilters; page: number; limit: number }
  ): Promise<{ data: Response[]; total: number }>;
  getAnswersByResponseId(responseId: string): Promise<Answer[]>;
  getSummaryByFormId(
    formId: string,
    filters?: ResponseFilters
  ): Promise<{ count: number; lastSubmittedAt: Date | null }>;
  delete(id: string): Promise<boolean>;
}
