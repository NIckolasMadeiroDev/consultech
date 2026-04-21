import { randomUUID } from "node:crypto";
import type { Form } from "@/core/entities";
import type { CreateFormData, IFormRepository } from "../form.repository.interface";
import type { UpdateFormInput } from "../form.schema";
import { getInMemoryFolderDisplayName } from "@/modules/folders/infrastructure/in-memory-folder.repository";
import { mergeFormTheme } from "../merge-form-theme";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";
import {
  defaultFormResponseSettings,
  parseFormResponseSettings,
  patchFormResponseSettings,
} from "@/types/form-response-settings";
import { parseFormSectionVisibilityRules } from "@/types/form-section-visibility";

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
      pausedMessage: data.pausedMessage,
      ...folderFields,
      isTemplate: data.isTemplate ?? false,
      status: data.status ?? "draft",
      version: 1,
      slug: data.slug,
      allowAnonymous: data.allowAnonymous ?? false,
      responseSettings: defaultFormResponseSettings(data.allowAnonymous ?? false),
      sectionVisibilityRules: [],
      theme: DEFAULT_FORM_THEME,
      submitButtonText: "Enviar",
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
    const {
      questions: _omitQuestions,
      closingMessage,
      pausedMessage,
      folderId,
      isTemplate,
      theme: themePatch,
      headerImage,
      logoImage,
      backgroundImage,
      welcomeMessage,
      submitButtonText,
      successMessage,
      successPageHtml,
      successRedirectUrl,
      successRedirectDelay,
      allowAnonymous: allowAnonymousPatch,
      responseSettings: responseSettingsPatch,
      sectionVisibilityRules: sectionVisibilityRulesPatch,
      ...restData
    } = data;
    void _omitQuestions;
    let folderFields: Pick<Form, "folderId" | "folder"> = {};
    if (folderId !== undefined) {
      folderFields =
        folderId === null ? { folderId: undefined, folder: undefined } : resolveFolderFields(folderId);
    } else {
      folderFields = { folderId: existing.folderId, folder: existing.folder };
    }
    const nextTheme =
      themePatch !== undefined ? mergeFormTheme(existing.theme, themePatch) : existing.theme;
    let nextResponseSettings = existing.responseSettings;
    let nextAllowAnonymous = existing.allowAnonymous;
    if (responseSettingsPatch !== undefined) {
      nextResponseSettings = patchFormResponseSettings(
        parseFormResponseSettings(existing.responseSettings, existing.allowAnonymous),
        responseSettingsPatch
      );
      nextAllowAnonymous = nextResponseSettings.respondentIdentificationMode === "anonymous";
    } else if (allowAnonymousPatch !== undefined) {
      nextResponseSettings = patchFormResponseSettings(
        parseFormResponseSettings(existing.responseSettings, existing.allowAnonymous),
        {
          respondentIdentificationMode: allowAnonymousPatch ? "anonymous" : "required",
        }
      );
      nextAllowAnonymous = nextResponseSettings.respondentIdentificationMode === "anonymous";
    }
    const updated: Form = {
      ...existing,
      ...restData,
      ...folderFields,
      allowAnonymous: nextAllowAnonymous,
      responseSettings: nextResponseSettings,
      sectionVisibilityRules:
        sectionVisibilityRulesPatch !== undefined
          ? parseFormSectionVisibilityRules(sectionVisibilityRulesPatch)
          : existing.sectionVisibilityRules,
      theme: nextTheme,
      headerImage: headerImage === undefined ? existing.headerImage : (headerImage ?? undefined),
      logoImage: logoImage === undefined ? existing.logoImage : (logoImage ?? undefined),
      backgroundImage:
        backgroundImage === undefined ? existing.backgroundImage : (backgroundImage ?? undefined),
      welcomeMessage:
        welcomeMessage === undefined ? existing.welcomeMessage : (welcomeMessage ?? undefined),
      submitButtonText:
        submitButtonText === undefined ? existing.submitButtonText : submitButtonText,
      successMessage:
        successMessage === undefined ? existing.successMessage : (successMessage ?? undefined),
      successPageHtml:
        successPageHtml === undefined ? existing.successPageHtml : (successPageHtml ?? undefined),
      successRedirectUrl:
        successRedirectUrl === undefined
          ? existing.successRedirectUrl
          : (successRedirectUrl ?? undefined),
      successRedirectDelay:
        successRedirectDelay === undefined
          ? existing.successRedirectDelay
          : (successRedirectDelay ?? undefined),
      closingMessage:
        closingMessage === undefined ? existing.closingMessage : (closingMessage ?? undefined),
      pausedMessage:
        pausedMessage === undefined ? existing.pausedMessage : (pausedMessage ?? undefined),
      isTemplate: isTemplate === undefined ? existing.isTemplate : isTemplate,
      slug,
      updatedAt: new Date(),
    };
    if (updated.slug) slugIndex.set(updated.slug, id);
    store.set(id, updated);
    return updated;
  }

  async setVersion(id: string, version: number): Promise<Form | null> {
    const existing = store.get(id);
    if (!existing) return null;
    const next = { ...existing, version, updatedAt: new Date() };
    store.set(id, next);
    return next;
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
      pausedMessage: existing.pausedMessage,
      ...folderFields,
      isTemplate: false,
      status: "draft",
      version: 1,
      slug: undefined,
      allowAnonymous: existing.allowAnonymous,
      responseSettings: existing.responseSettings,
      sectionVisibilityRules: parseFormSectionVisibilityRules(existing.sectionVisibilityRules),
      theme: existing.theme,
      headerImage: existing.headerImage,
      logoImage: existing.logoImage,
      backgroundImage: existing.backgroundImage,
      welcomeMessage: existing.welcomeMessage,
      submitButtonText: existing.submitButtonText,
      successMessage: existing.successMessage,
      successPageHtml: existing.successPageHtml,
      successRedirectUrl: existing.successRedirectUrl,
      successRedirectDelay: existing.successRedirectDelay,
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
