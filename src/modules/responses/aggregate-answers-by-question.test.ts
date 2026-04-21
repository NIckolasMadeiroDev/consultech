import { describe, it, expect } from "vitest";
import { aggregateAnswersByQuestion } from "./aggregate-answers-by-question";
import type { Question } from "@/core/entities/question.entity";

describe("aggregateAnswersByQuestion", () => {
  it("agrega opções e contagem", () => {
    const questions: Question[] = [
      {
        id: "q1",
        formId: "f1",
        type: "multiple_choice",
        text: "Cor",
        required: false,
        orderIndex: 0,
        options: ["A", "B"],
      },
    ];
    const rows = [
      { answers: [{ questionId: "q1", value: "A" }] },
      { answers: [{ questionId: "q1", value: "A" }] },
      { answers: [{ questionId: "q1", value: "B" }] },
    ];
    const agg = aggregateAnswersByQuestion(questions, rows);
    expect(agg[0]?.optionCounts?.A).toBe(2);
    expect(agg[0]?.optionCounts?.B).toBe(1);
    expect(agg[0]?.total).toBe(3);
  });
});
