import { describe, it, expect } from "vitest";
import { distributionLabelsForChart, labelsForAnswerValue } from "./aggregate-answers-by-question";

describe("distributionLabelsForChart", () => {
  it("matches labelsForAnswerValue for structured types", () => {
    expect(distributionLabelsForChart("multiple_choice", "A")).toEqual(labelsForAnswerValue("multiple_choice", "A"));
  });

  it("returns numeric string for scale values", () => {
    expect(distributionLabelsForChart("scale", 4)).toEqual(["4"]);
  });

  it("returns truncated text for open answers", () => {
    const long = "a".repeat(200);
    const got = distributionLabelsForChart("long_text", long);
    expect(got[0]?.length).toBeLessThanOrEqual(120);
  });
});
