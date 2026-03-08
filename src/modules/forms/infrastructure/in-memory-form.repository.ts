import { randomUUID } from "node:crypto";
import type { Form } from "@/core/entities";
import type { CreateFormData, IFormRepository } from "../form.repository.interface";
import type { UpdateFormInput } from "../form.schema";

const store: Map<string, Form> = new Map();
const slugIndex: Map<string, string> = new Map();

export class InMemoryFormRepository implements IFormRepository {
  async create(data: CreateFormData): Promise<Form> {
    const now = new Date();
    const form: Form = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      status: "draft",
      version: 1,
      slug: data.slug,
      allowAnonymous: data.allowAnonymous ?? false,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    store.set(form.id, form);
    if (form.slug) slugIndex.set(form.slug, form.id);
    return form;
  }

  async findById(id: string): Promise<Form | null> {
    return store.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Form | null> {
    const id = slugIndex.get(slug);
    return id ? store.get(id) ?? null : null;
  }

  async findByCreatedBy(createdBy: string): Promise<Form[]> {
    return Array.from(store.values()).filter((f) => f.createdBy === createdBy);
  }

  async update(id: string, data: UpdateFormInput): Promise<Form | null> {
    const existing = store.get(id);
    if (!existing) return null;
    if (existing.slug) slugIndex.delete(existing.slug);
    const slug = data.slug === undefined ? existing.slug : (data.slug ?? undefined);
    const updated: Form = {
      ...existing,
      ...data,
      slug,
      updatedAt: new Date(),
    };
    if (updated.slug) slugIndex.set(updated.slug, id);
    store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const form = store.get(id);
    if (form?.slug) slugIndex.delete(form.slug);
    return store.delete(id);
  }

  async duplicate(id: string, createdBy: string): Promise<Form | null> {
    const existing = store.get(id);
    if (!existing) return null;
    const now = new Date();
    const newForm: Form = {
      id: randomUUID(),
      title: `${existing.title} (cópia)`,
      description: existing.description,
      status: "draft",
      version: 1,
      slug: undefined,
      allowAnonymous: existing.allowAnonymous,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    store.set(newForm.id, newForm);
    return newForm;
  }
}

export function clearFormStore(): void {
  store.clear();
  slugIndex.clear();
}
