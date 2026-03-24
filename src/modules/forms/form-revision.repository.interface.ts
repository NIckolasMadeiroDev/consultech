export type FormRevisionRow = {
  id: string;
  formId: string;
  version: number;
  editedById: string | null;
  editorName: string | null;
  summary: string;
  details: unknown;
  createdAt: Date;
};

export type CreateFormRevisionInput = {
  formId: string;
  version: number;
  editedById: string | null;
  summary: string;
  details?: unknown;
};

export interface IFormRevisionRepository {
  create(data: CreateFormRevisionInput): Promise<FormRevisionRow>;
  findByFormId(formId: string, limit?: number): Promise<FormRevisionRow[]>;
}
