import type { Question } from "@/core/entities/question.entity";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import { isQuestionVisible } from "@/lib/question-visibility";
import type { SectionVisibilityRule } from "@/types/form-section-visibility";
import { isSectionKeyVisible } from "./evaluate-section-visibility";

function sectionDisplayTitle(q: Pick<Question, "sectionTitle" | "text">): string {
  const alt = q.sectionTitle?.trim();
  if (alt) return alt;
  return q.text?.trim() || "Geral";
}

export function filterVisibleResponseQuestions(
  sortedQuestions: Question[],
  answers: Record<string, unknown>,
  sectionRules: SectionVisibilityRule[],
  respondent: { department?: string } | null
): Question[] {
  const ctx = { answers, respondent };
  let sectionKey = "Geral";
  let sectionActive = isSectionKeyVisible(sectionKey, sectionRules, ctx);
  const out: Question[] = [];

  for (const q of sortedQuestions) {
    if (q.type === "section") {
      sectionKey = sectionDisplayTitle(q);
      sectionActive = isSectionKeyVisible(sectionKey, sectionRules, ctx);
      if (sectionActive) out.push(q);
      continue;
    }
    if (!sectionActive) continue;
    if (!isQuestionVisible(q, answers)) continue;
    out.push(q);
  }
  return out;
}

export function answerableVisibleQuestionIds(
  sortedQuestions: Question[],
  answers: Record<string, unknown>,
  sectionRules: SectionVisibilityRule[],
  respondent: { department?: string } | null
): Set<string> {
  const vis = filterVisibleResponseQuestions(sortedQuestions, answers, sectionRules, respondent);
  return new Set(vis.filter((q) => acceptsAnswerValue(q.type)).map((q) => q.id));
}
