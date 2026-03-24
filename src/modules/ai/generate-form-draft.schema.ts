import { z } from "zod";

const questionTypeSchema = z.enum([
  "section",
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "checkbox",
  "scale",
  "yes_no",
  "date",
  "number",
]);

const aiQuestionRowSchema = z.object({
  type: questionTypeSchema,
  text: z.string().min(1).max(2000),
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional(),
  scaleMin: z.number().int().optional(),
  scaleMax: z.number().int().optional(),
});

export const aiFormDraftFromModelSchema = z
  .object({
    title: z.string().min(1).max(300),
    description: z.string().max(5000).optional(),
    closingMessage: z.string().max(5000).optional(),
    questions: z.array(aiQuestionRowSchema).min(1).max(45),
  })
  .refine((d) => d.questions.some((q) => q.type !== "section"), {
    message: "Inclua ao menos uma pergunta além de seções.",
    path: ["questions"],
  });

export const generateFormDraftRequestSchema = z.object({
  prompt: z.string().trim().min(12).max(8000),
});

export type AiFormDraftFromModel = z.infer<typeof aiFormDraftFromModelSchema>;
export type GenerateFormDraftRequestInput = z.infer<typeof generateFormDraftRequestSchema>;
