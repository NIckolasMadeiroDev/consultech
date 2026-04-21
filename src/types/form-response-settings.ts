export type RespondentIdentificationMode = "required" | "optional" | "anonymous";

export type ResponseLayoutMode = "single_page" | "wizard_by_section" | "wizard_by_question";

export type FormResponseSettings = {
  respondentIdentificationMode: RespondentIdentificationMode;
  responseLayoutMode: ResponseLayoutMode;
  showProgressBar: boolean;
  allowSaveDraft: boolean;
};

export function defaultFormResponseSettings(
  allowAnonymous: boolean
): FormResponseSettings {
  return {
    respondentIdentificationMode: allowAnonymous ? "anonymous" : "required",
    responseLayoutMode: "single_page",
    showProgressBar: true,
    allowSaveDraft: true,
  };
}

export function parseFormResponseSettings(
  raw: unknown,
  allowAnonymous: boolean
): FormResponseSettings {
  const base = defaultFormResponseSettings(allowAnonymous);
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const o = raw as Record<string, unknown>;
  const mode = o.respondentIdentificationMode;
  const layout = o.responseLayoutMode;
  const bar = o.showProgressBar;
  const draft = o.allowSaveDraft;
  return {
    respondentIdentificationMode:
      mode === "required" || mode === "optional" || mode === "anonymous"
        ? mode
        : base.respondentIdentificationMode,
    responseLayoutMode:
      layout === "single_page" ||
      layout === "wizard_by_section" ||
      layout === "wizard_by_question"
        ? layout
        : base.responseLayoutMode,
    showProgressBar: typeof bar === "boolean" ? bar : base.showProgressBar,
    allowSaveDraft: typeof draft === "boolean" ? draft : base.allowSaveDraft,
  };
}

export function patchFormResponseSettings(
  current: FormResponseSettings,
  patch: Partial<FormResponseSettings>
): FormResponseSettings {
  return {
    respondentIdentificationMode:
      patch.respondentIdentificationMode ?? current.respondentIdentificationMode,
    responseLayoutMode: patch.responseLayoutMode ?? current.responseLayoutMode,
    showProgressBar: patch.showProgressBar ?? current.showProgressBar,
    allowSaveDraft: patch.allowSaveDraft ?? current.allowSaveDraft,
  };
}
