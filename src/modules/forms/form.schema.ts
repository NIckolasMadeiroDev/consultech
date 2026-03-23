import { z } from "zod";

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
]);

export const questionSchema = z.object({
  type: questionTypeSchema,
  text: z.string().min(1),
  required: z.boolean().default(false),
  orderIndex: z.number().int().min(0),
  options: z.array(z.string()).optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  conditionQuestionId: z.string().uuid().optional().nullable(),
  conditionOperator: z.string().optional().nullable(),
  conditionValue: z.unknown().optional().nullable(),
});

const questionsNeedAnswerableRefine = (questions: z.infer<typeof questionSchema>[]) =>
  questions.some((q) => q.type !== "section");

export const createFormSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().optional(),
    closingMessage: z.string().max(5000).optional(),
    folderId: z.string().uuid().optional().nullable(),
    isTemplate: z.boolean().optional(),
    questions: z.array(questionSchema).min(1),
    slug: z.string().min(1).max(100).optional(),
    allowAnonymous: z.boolean().optional(),
    initialStatus: z.enum(["draft", "active"]).default("draft"),
  })
  .refine((d) => questionsNeedAnswerableRefine(d.questions), {
    message: "Inclua ao menos uma pergunta (além de seções).",
    path: ["questions"],
  });

export const updateFormSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    closingMessage: z.string().max(5000).optional().nullable(),
    folderId: z.string().uuid().optional().nullable(),
    isTemplate: z.boolean().optional(),
    status: z.enum(["draft", "active", "archived", "paused"]).optional(),
    questions: z.array(questionSchema.extend({ id: z.string().uuid().optional() })).optional(),
    slug: z.string().min(1).max(100).optional().nullable(),
    allowAnonymous: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.questions === undefined ||
      (d.questions.length > 0 && questionsNeedAnswerableRefine(d.questions)),
    {
      message: "Inclua ao menos uma pergunta (além de seções).",
      path: ["questions"],
    }
  );

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type QuestionSchemaInput = z.infer<typeof questionSchema>;
