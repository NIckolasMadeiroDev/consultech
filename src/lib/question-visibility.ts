export type QuestionLike = {
  conditionQuestionId?: string | null;
  conditionOperator?: string | null;
  conditionValue?: unknown;
};

export function isQuestionVisible(
  q: QuestionLike,
  answers: Record<string, unknown>
): boolean {
  if (!q.conditionQuestionId) return true;
  const ref = answers[q.conditionQuestionId];
  const target = q.conditionValue;
  const op = q.conditionOperator ?? "eq";
  if (op === "eq") return ref === target;
  if (op === "neq") return ref !== target;
  if (op === "contains") {
    if (Array.isArray(ref)) return ref.includes(target as string);
    if (typeof ref === "string") return ref.includes(String(target));
    return false;
  }
  return true;
}
