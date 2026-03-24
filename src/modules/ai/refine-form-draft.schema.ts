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

export const refineCurrentQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  type: questionTypeSchema,
  text: z.string().max(2000),
  required: z.boolean(),
  orderIndex: z.number().int().min(0).optional(),
  options: z.array(z.string()).optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
});

export const refineFormRequestSchema = z.object({
  prompt: z.string().trim().min(8).max(8000),
  current: z.object({
    title: z.string().max(300),
    description: z.string().max(5000).optional(),
    closingMessage: z.string().max(5000).optional(),
    pausedMessage: z.string().max(2000).optional(),
    responseCount: z.number().int().min(0).optional(),
    questions: z.array(refineCurrentQuestionSchema).max(50),
  }),
});

const aiRefineQuestionRowSchema = z.object({
  id: z.string().uuid().optional(),
  type: questionTypeSchema,
  text: z.string().min(1).max(2000),
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional(),
  scaleMin: z.number().int().optional(),
  scaleMax: z.number().int().optional(),
});

export const aiFormRefineFromModelSchema = z
  .object({
    title: z.string().min(1).max(300),
    description: z.string().max(5000).optional(),
    closingMessage: z.string().max(5000).optional(),
    pausedMessage: z.string().max(2000).optional(),
    questions: z.array(aiRefineQuestionRowSchema).min(1).max(45),
  })
  .refine((d) => d.questions.some((q) => q.type !== "section"), {
    message: "Inclua ao menos uma pergunta além de seções.",
    path: ["questions"],
  });

export type RefineFormRequestInput = z.infer<typeof refineFormRequestSchema>;
export type AiFormRefineFromModel = z.infer<typeof aiFormRefineFromModelSchema>;
