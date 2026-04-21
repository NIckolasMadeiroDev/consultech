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

export const responseAttachmentSchema = z.object({
  questionId: z.string().uuid(),
  storagePath: z.string().min(1).max(2048),
  publicUrl: z.string().url().max(4096),
  sizeBytes: z.number().int().min(0).max(524288000),
  mimeType: z.string().min(1).max(200),
  originalFilename: z.string().min(1).max(512),
});

export const submitResponseSchema = z.object({
  formId: z.string().uuid(),
  respondent: respondentSchema.optional(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      value: answerValueSchema,
    })
  ).min(1),
  attachments: z.array(responseAttachmentSchema).optional(),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
