"use client";

import { forwardRef } from "react";
import { FormRespondAppearance } from "@/components/forms/form-respond-appearance";
import { RespondFormView, type RespondFormQuestion } from "@/components/forms/respond-form-view";
import type { FormTheme } from "@/types/form-theme";
import { useResolvedFormTheme } from "@/hooks/use-resolved-form-theme";

const SAMPLE_QUESTIONS: RespondFormQuestion[] = [
  {
    id: "preview-q1",
    type: "short_text",
    text: "Exemplo de pergunta de texto curto",
    required: true,
    orderIndex: 0,
  },
];

type FormPreviewProps = {
  readonly formId: string;
  readonly title: string;
  readonly description?: string;
  readonly questions: RespondFormQuestion[];
  readonly theme: FormTheme;
  readonly headerImage?: string;
  readonly logoImage?: string;
  readonly backgroundImage?: string;
  readonly welcomeMessage?: string;
  readonly submitButtonText?: string;
  readonly successMessage?: string;
  readonly successPageHtml?: string;
  readonly successRedirectUrl?: string;
  readonly successRedirectDelay?: number;
  readonly previewForceDark?: boolean;
};

export const FormPreview = forwardRef<HTMLDivElement, FormPreviewProps>(function FormPreview(
  {
    formId,
    title,
    description,
    questions,
    theme,
    headerImage,
    logoImage,
    backgroundImage,
    welcomeMessage,
    submitButtonText,
    successMessage,
    successPageHtml,
    successRedirectUrl,
    successRedirectDelay,
    previewForceDark,
  },
  ref
) {
  const qs = questions.length > 0 ? questions : SAMPLE_QUESTIONS;
  const resolvedVisual = useResolvedFormTheme(theme, previewForceDark);
  return (
    <div
      ref={ref}
      className="max-h-[min(70vh,560px)] overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-100 p-2 dark:border-neutral-700 dark:bg-neutral-900/40"
    >
      <FormRespondAppearance
        theme={theme}
        previewForceDark={previewForceDark}
        headerImage={headerImage}
        logoImage={logoImage}
        backgroundImage={backgroundImage}
      >
        <RespondFormView
          formId={formId}
          preview
          themeVisual={resolvedVisual}
          form={{
            title,
            description,
            allowAnonymous: true,
            welcomeMessage,
            submitButtonText,
            successMessage,
            successPageHtml: successPageHtml ?? null,
            successRedirectUrl: successRedirectUrl ?? null,
            successRedirectDelay: successRedirectDelay ?? 0,
            questions: qs,
          }}
        />
      </FormRespondAppearance>
    </div>
  );
});
