import { z } from "zod";
import { FORM_QUESTION_ICON_NAMES } from "@/lib/form-question-icon-options";
import { acceptsAnswerValue, allowsEmptyQuestionText } from "@/lib/form-question-kinds";
import { isEmbeddableVideoPageUrl } from "@/lib/video-embed-url";
import { patchFormThemeSchema } from "@/modules/forms/form-theme.schema";
import { sectionVisibilityRuleSchema } from "@/types/form-section-visibility";

const formResponseSettingsPatchSchema = z.object({
  respondentIdentificationMode: z.enum(["required", "optional", "anonymous"]).optional(),
  responseLayoutMode: z.enum(["single_page", "wizard_by_section", "wizard_by_question"]).optional(),
  showProgressBar: z.boolean().optional(),
  allowSaveDraft: z.boolean().optional(),
});

const questionTypeSchema = z.enum([
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "checkbox",
  "scale",
  "yes_no",
  "date",
  "number",
  "section",
  "text_block",
  "markdown_block",
  "separator",
  "image_block",
  "video_block",
  "file_download",
  "file_upload",
]);

const separatorStyleSchema = z.enum(["solid", "dashed", "dotted", "spacer"]);

const fileUploadRulesSchema = z.object({
  maxFileBytes: z.number().int().min(1024).max(52428800),
  maxFiles: z.number().int().min(1).max(10),
  allowedExtensions: z.array(z.string().min(1).max(12)).max(24),
  required: z.boolean(),
});

function isProbablyHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const optionalNullableHttpUrl = z.preprocess(
  (v: unknown) => (v === "" ? null : v),
  z
    .union([
      z.null(),
      z.string().max(2048).refine((s) => isProbablyHttpUrl(s), "URL inválida."),
    ])
    .optional()
);

const optionalNullableLongText = z.preprocess(
  (v: unknown) => (v === "" ? null : v),
  z.union([z.null(), z.string().max(10000)]).optional()
);

const optionalNullableRichHtml = z.preprocess(
  (v: unknown) => (v === "" ? null : v),
  z.union([z.null(), z.string().max(200_000)]).optional()
);

const questionObjectSchema = z.object({
  type: questionTypeSchema,
  text: z.string().max(5000),
  required: z.boolean().default(false),
  orderIndex: z.number().int().min(0),
  options: z.array(z.string()).optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  conditionQuestionId: z.string().uuid().optional().nullable(),
  conditionOperator: z.string().optional().nullable(),
  conditionValue: z.unknown().optional().nullable(),
  sectionTitle: z.string().max(500).optional().nullable(),
  sectionDescription: z.string().max(5000).optional().nullable(),
  helpText: z.string().max(2000).optional().nullable(),
  placeholder: z.string().max(300).optional().nullable(),
  contentHtml: z.string().max(100_000).optional().nullable(),
  imageUrl: z.string().max(2048).optional().nullable(),
  videoUrl: z.string().max(2048).optional().nullable(),
  imageAlt: z.string().max(500).optional().nullable(),
  separatorStyle: separatorStyleSchema.optional().nullable(),
  fileDownloadUrl: z.string().max(2048).optional().nullable(),
  fileDownloadLabel: z.string().max(500).optional().nullable(),
  fileDownloadMime: z.string().max(200).optional().nullable(),
  fileUploadRules: fileUploadRulesSchema.optional().nullable(),
  customIcon: z.union([z.null(), z.string().max(48)]).optional(),
});

function refineQuestion(
  q: z.infer<typeof questionObjectSchema>,
  ctx: z.RefinementCtx
): void {
    if (!acceptsAnswerValue(q.type) && q.required) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["required"],
        message: "Este tipo não pode ser obrigatório.",
      });
    }
    if (!allowsEmptyQuestionText(q.type) && q.text.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["text"],
        message: "Título ou rótulo é obrigatório.",
      });
    }
    if (q.type === "text_block") {
      if (!q.contentHtml?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contentHtml"],
          message: "Conteúdo HTML do bloco é obrigatório.",
        });
      }
    }
    if (q.type === "markdown_block") {
      if (!q.contentHtml?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contentHtml"],
          message: "Texto em Markdown é obrigatório.",
        });
      }
    }
    if (q.type === "image_block") {
      const u = q.imageUrl?.trim() ?? "";
      if (!u) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["imageUrl"],
          message: "URL da imagem é obrigatória.",
        });
      } else if (!isProbablyHttpUrl(u)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["imageUrl"],
          message: "URL da imagem inválida.",
        });
      }
    }
    if (q.type === "video_block") {
      const u = q.videoUrl?.trim() ?? "";
      if (!u) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["videoUrl"],
          message: "URL do vídeo é obrigatória.",
        });
      } else if (!isEmbeddableVideoPageUrl(u)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["videoUrl"],
          message: "Use um link do YouTube ou Vimeo.",
        });
      }
    }
    if (q.type === "separator") {
      if (q.separatorStyle && !separatorStyleSchema.safeParse(q.separatorStyle).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["separatorStyle"],
          message: "Estilo de separador inválido.",
        });
      }
    }
    if (q.type === "file_download") {
      const url = q.fileDownloadUrl?.trim() ?? "";
      const label = q.fileDownloadLabel?.trim() ?? "";
      const mime = q.fileDownloadMime?.trim() ?? "";
      if (!url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileDownloadUrl"],
          message: "URL do ficheiro é obrigatória.",
        });
      } else if (!isProbablyHttpUrl(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileDownloadUrl"],
          message: "URL do ficheiro inválida.",
        });
      }
      if (!label) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileDownloadLabel"],
          message: "Nome do ficheiro é obrigatório.",
        });
      }
      if (!mime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileDownloadMime"],
          message: "Tipo MIME é obrigatório.",
        });
      }
    }
    if (q.type === "file_upload") {
      if (!q.fileUploadRules) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileUploadRules"],
          message: "Regras de envio são obrigatórias.",
        });
      }
    }
    if (q.customIcon != null && q.customIcon !== "") {
      if (!FORM_QUESTION_ICON_NAMES.includes(q.customIcon as (typeof FORM_QUESTION_ICON_NAMES)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customIcon"],
          message: "Ícone inválido.",
        });
      }
    }
}

export const questionSchema = questionObjectSchema.superRefine(refineQuestion);

const patchQuestionSchema = questionObjectSchema
  .extend({ id: z.string().uuid().optional() })
  .superRefine(refineQuestion);

const questionsNeedAnswerableRefine = (questions: z.infer<typeof questionSchema>[]) =>
  questions.some((q) => acceptsAnswerValue(q.type));

export const createFormSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().optional(),
    closingMessage: z.string().max(5000).optional(),
    pausedMessage: z.string().max(2000).optional(),
    folderId: z.string().uuid().optional().nullable(),
    isTemplate: z.boolean().optional(),
    questions: z.array(questionSchema).min(1),
    slug: z.string().min(1).max(100).optional(),
    allowAnonymous: z.boolean().optional(),
    initialStatus: z.enum(["draft", "active"]).default("draft"),
  })
  .refine((d) => questionsNeedAnswerableRefine(d.questions), {
    message: "Inclua ao menos uma pergunta que aceite resposta (além de blocos e secções).",
    path: ["questions"],
  });

export const updateFormSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    closingMessage: z.string().max(5000).optional().nullable(),
    pausedMessage: z.string().max(2000).optional().nullable(),
    folderId: z.string().uuid().optional().nullable(),
    isTemplate: z.boolean().optional(),
    status: z.enum(["draft", "active", "archived", "paused"]).optional(),
    questions: z.array(patchQuestionSchema).optional(),
    slug: z.string().min(1).max(100).optional().nullable(),
    allowAnonymous: z.boolean().optional(),
    theme: patchFormThemeSchema.optional(),
    headerImage: optionalNullableHttpUrl,
    logoImage: optionalNullableHttpUrl,
    backgroundImage: optionalNullableHttpUrl,
    welcomeMessage: optionalNullableLongText,
    submitButtonText: z.string().min(1).max(120).optional(),
    successMessage: optionalNullableLongText,
    successPageHtml: optionalNullableRichHtml,
    successRedirectUrl: optionalNullableHttpUrl,
    successRedirectDelay: z.number().int().min(0).max(600).optional().nullable(),
    responseSettings: formResponseSettingsPatchSchema.optional(),
    sectionVisibilityRules: z.array(sectionVisibilityRuleSchema).max(48).optional(),
  })
  .refine(
    (d) =>
      d.questions === undefined ||
      (d.questions.length > 0 && questionsNeedAnswerableRefine(d.questions)),
    {
      message: "Inclua ao menos uma pergunta que aceite resposta (além de blocos e secções).",
      path: ["questions"],
    }
  );

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type QuestionSchemaInput = z.infer<typeof questionSchema>;
