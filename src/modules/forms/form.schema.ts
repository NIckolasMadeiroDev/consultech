import { z } from "zod";

const questionTypeSchema = z.enum([
  "short_text",
  "long_text",
  "multiple_choice",
  "checkbox",
  "scale",
  "yes_no",
  "date",
  "number",
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

export const createFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
  slug: z.string().min(1).max(100).optional(),
  allowAnonymous: z.boolean().optional(),
});

export const updateFormSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived", "paused"]).optional(),
  questions: z.array(questionSchema.extend({ id: z.string().uuid().optional() })).optional(),
  slug: z.string().min(1).max(100).optional().nullable(),
  allowAnonymous: z.boolean().optional(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type QuestionSchemaInput = z.infer<typeof questionSchema>;
