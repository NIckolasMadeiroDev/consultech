import type { SectionVisibilityRule } from "@/types/form-section-visibility";

export type SectionConditionContext = {
  readonly answers: Record<string, unknown>;
  readonly respondent: { department?: string } | null;
};

function normalizeKey(s: string): string {
  return s.trim().toLowerCase();
}

export function evaluateSectionCondition(
  condition: SectionVisibilityRule["condition"],
  ctx: SectionConditionContext
): boolean {
  if (condition.type === "respondent_department") {
    const dept = ctx.respondent?.department?.trim() ?? "";
    if (!dept) return false;
    const v = condition.value.trim();
    if (condition.op === "eq") return normalizeKey(dept) === normalizeKey(v);
    return normalizeKey(dept).includes(normalizeKey(v));
  }
  const ref = ctx.answers[condition.questionId];
  if (condition.op === "eq") return ref === condition.value;
  if (condition.op === "neq") return ref !== condition.value;
  if (condition.op === "in" && condition.values) return condition.values.some((x) => Object.is(x, ref));
  return false;
}

export function isSectionKeyVisible(
  sectionKey: string,
  rules: SectionVisibilityRule[],
  ctx: SectionConditionContext
): boolean {
  const r = rules.find((x) => normalizeKey(x.sectionTitle) === normalizeKey(sectionKey));
  if (!r) return true;
  return evaluateSectionCondition(r.condition, ctx);
}
