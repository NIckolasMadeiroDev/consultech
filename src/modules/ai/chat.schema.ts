import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export const chatCompletionRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  model: z.string().min(1).default("grok-4-latest"),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional().default(0),
  max_tokens: z.number().int().positive().optional(),
});

export type ChatCompletionRequestInput = z.infer<typeof chatCompletionRequestSchema>;
