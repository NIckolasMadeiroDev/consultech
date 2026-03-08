import { z } from "zod";

export const respondentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
});

export const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]);

export const submitResponseSchema = z.object({
  formId: z.string().uuid(),
  respondent: respondentSchema.optional(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      value: answerValueSchema,
    })
  ).min(1),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
