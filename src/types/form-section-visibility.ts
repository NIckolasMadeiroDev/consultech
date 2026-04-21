import { z } from "zod";

const sectionVisibilityConditionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("respondent_department"),
    op: z.enum(["eq", "contains"]),
    value: z.string().min(1).max(200),
  }),
  z.object({
    type: z.literal("answer"),
    questionId: z.string().uuid(),
    op: z.enum(["eq", "neq", "in"]),
    value: z.unknown().optional(),
    values: z.array(z.unknown()).optional(),
  }),
]);

export const sectionVisibilityRuleSchema = z.object({
  sectionTitle: z.string().min(1).max(500),
  condition: sectionVisibilityConditionSchema,
});

export type SectionVisibilityRule = z.infer<typeof sectionVisibilityRuleSchema>;

export function parseFormSectionVisibilityRules(raw: unknown): SectionVisibilityRule[] {
  const parsed = z.array(sectionVisibilityRuleSchema).safeParse(raw);
  return parsed.success ? parsed.data : [];
}
