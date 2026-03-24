import { z } from "zod";

export const suggestFormCopyKindSchema = z.enum([
  "form_description",
  "closing_message",
  "paused_message",
  "share_invite",
]);

export const suggestFormCopyRequestSchema = z.object({
  kind: suggestFormCopyKindSchema,
  title: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  shareLink: z.string().url().max(2000).optional().nullable(),
  shortLink: z.string().url().max(2000).optional().nullable(),
});

export const suggestFormCopyResponseSchema = z.object({
  text: z.string().min(1).max(5000),
});

export type SuggestFormCopyKind = z.infer<typeof suggestFormCopyKindSchema>;
export type SuggestFormCopyRequest = z.infer<typeof suggestFormCopyRequestSchema>;
