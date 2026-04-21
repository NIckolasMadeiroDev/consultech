import type { Response, Answer } from "@/core/entities";
import type { ResponseFilters } from "@/types";
import type { ResponseAttachmentInput } from "./response-attachment.types";

export interface SubmitResponseInput {
  formId: string;
  respondentId: string | null;
  answers: Array<{ questionId: string; value: string | number | boolean | string[] }>;
  attachments?: ResponseAttachmentInput[];
  submissionMetadata?: Record<string, unknown> | null;
}

export type { ResponseAttachmentInput };

export type ResponseAttachmentRecord = {
  questionId: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
};

export interface IResponseRepository {
  create(data: SubmitResponseInput): Promise<Response>;
  findById(id: string): Promise<Response | null>;
  findByFormId(formId: string, filters?: ResponseFilters): Promise<Response[]>;
  findPageByFormId(
    formId: string,
    opts: { filters?: ResponseFilters; page: number; limit: number }
  ): Promise<{ data: Response[]; total: number }>;
  getAnswersByResponseId(responseId: string): Promise<Answer[]>;
  getAttachmentsByResponseId(responseId: string): Promise<ResponseAttachmentRecord[]>;
  getSummaryByFormId(
    formId: string,
    filters?: ResponseFilters
  ): Promise<{ count: number; lastSubmittedAt: Date | null }>;
  findRecentByFormIdWithAnswers(
    formId: string,
    filters: ResponseFilters | undefined,
    limit: number
  ): Promise<Array<{ submittedAt: Date; answers: Array<{ questionId: string; value: unknown }> }>>;
  delete(id: string): Promise<boolean>;
}
