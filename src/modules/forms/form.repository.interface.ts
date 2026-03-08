import type { Form } from "@/core/entities";
import type { UpdateFormInput } from "./form.schema";

export interface CreateFormData {
  title: string;
  description?: string;
  createdBy: string;
  slug?: string;
  allowAnonymous?: boolean;
}

export interface IFormRepository {
  create(data: CreateFormData): Promise<Form>;
  findById(id: string): Promise<Form | null>;
  findBySlug(slug: string): Promise<Form | null>;
  findByCreatedBy(createdBy: string): Promise<Form[]>;
  update(id: string, data: UpdateFormInput): Promise<Form | null>;
  delete(id: string): Promise<boolean>;
  duplicate(id: string, createdBy: string): Promise<Form | null>;
}
