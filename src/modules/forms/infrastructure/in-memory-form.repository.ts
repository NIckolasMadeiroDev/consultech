import { randomUUID } from "node:crypto";
import type { Form } from "@/core/entities";
import type { CreateFormData, IFormRepository } from "../form.repository.interface";
import type { UpdateFormInput } from "../form.schema";
import { getInMemoryFolderDisplayName } from "@/modules/folders/infrastructure/in-memory-folder.repository";

const store: Map<string, Form> = new Map();
const slugIndex: Map<string, string> = new Map();

function resolveFolderFields(folderId?: string): Pick<Form, "folderId" | "folder"> {
  if (!folderId) return {};
  const name = getInMemoryFolderDisplayName(folderId);
  return { folderId, folder: name };
}

export class InMemoryFormRepository implements IFormRepository {
  async create(data: CreateFormData): Promise<Form> {
    const now = new Date();
    const folderFields = resolveFolderFields(data.folderId);
    const form: Form = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      closingMessage: data.closingMessage,
      ...folderFields,
      isTemplate: data.isTemplate ?? false,
      status: data.status ?? "draft",
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
    const fid = slugIndex.get(slug);
    return fid ? store.get(fid) ?? null : null;
  }

  async findByCreatedBy(createdBy: string): Promise<Form[]> {
    return Array.from(store.values()).filter((f) => f.createdBy === createdBy);
  }

  async update(id: string, data: UpdateFormInput): Promise<Form | null> {
    const existing = store.get(id);
    if (!existing) return null;
    if (existing.slug) slugIndex.delete(existing.slug);
    const slug = data.slug === undefined ? existing.slug : (data.slug ?? undefined);
    const { questions: _omitQuestions, closingMessage, folderId, isTemplate, ...restData } = data;
    void _omitQuestions;
    let folderFields: Pick<Form, "folderId" | "folder"> = {};
    if (folderId !== undefined) {
      folderFields =
        folderId === null ? { folderId: undefined, folder: undefined } : resolveFolderFields(folderId);
    } else {
      folderFields = { folderId: existing.folderId, folder: existing.folder };
    }
    const updated: Form = {
      ...existing,
      ...restData,
      ...folderFields,
      closingMessage:
        closingMessage === undefined ? existing.closingMessage : (closingMessage ?? undefined),
      isTemplate: isTemplate === undefined ? existing.isTemplate : isTemplate,
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
    const folderFields = resolveFolderFields(existing.folderId);
    const newForm: Form = {
      id: randomUUID(),
      title: `${existing.title} (cópia)`,
      description: existing.description,
      closingMessage: existing.closingMessage,
      ...folderFields,
      isTemplate: false,
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
