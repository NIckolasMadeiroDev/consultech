import { z } from "zod";

export const summarizeResponsesInsightsBodySchema = z.object({
  mode: z.enum(["summary", "insights"]),
  startDate: z.string().max(32).optional(),
  endDate: z.string().max(32).optional(),
  respondentSearch: z.string().max(200).optional(),
  answerSearch: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
});

export type SummarizeResponsesInsightsBody = z.infer<typeof summarizeResponsesInsightsBodySchema>;
