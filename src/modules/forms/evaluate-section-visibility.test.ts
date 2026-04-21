import { describe, it, expect } from "vitest";
import { evaluateSectionCondition, isSectionKeyVisible } from "./evaluate-section-visibility";
import type { SectionVisibilityRule } from "@/types/form-section-visibility";

describe("evaluateSectionCondition", () => {
  it("rejeita departamento quando respondente sem departamento", () => {
    const c: SectionVisibilityRule["condition"] = {
      type: "respondent_department",
      op: "eq",
      value: "MKT",
    };
    expect(evaluateSectionCondition(c, { answers: {}, respondent: null })).toBe(false);
  });

  it("aceita departamento igual (case insensitive)", () => {
    const c: SectionVisibilityRule["condition"] = {
      type: "respondent_department",
      op: "eq",
      value: "marketing",
    };
    expect(
      evaluateSectionCondition(c, { answers: {}, respondent: { department: "Marketing" } })
    ).toBe(true);
  });

  it("avalia resposta in", () => {
    const c: SectionVisibilityRule["condition"] = {
      type: "answer",
      questionId: "q1",
      op: "in",
      values: ["a", "b"],
    };
    expect(evaluateSectionCondition(c, { answers: { q1: "a" }, respondent: null })).toBe(true);
    expect(evaluateSectionCondition(c, { answers: { q1: "c" }, respondent: null })).toBe(false);
  });
});

describe("isSectionKeyVisible", () => {
  it("sem regra devolve true", () => {
    const rules: SectionVisibilityRule[] = [];
    expect(isSectionKeyVisible("Geral", rules, { answers: {}, respondent: null })).toBe(true);
  });
});
