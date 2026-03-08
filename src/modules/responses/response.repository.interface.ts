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
  getAnswersByResponseId(responseId: string): Promise<Answer[]>;
  delete(id: string): Promise<boolean>;
}
