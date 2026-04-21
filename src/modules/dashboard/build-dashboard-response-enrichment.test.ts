import { describe, it, expect } from "vitest";
import { computeHideAbandonmentDefault } from "./build-dashboard-response-enrichment";

describe("computeHideAbandonmentDefault", () => {
  it("returns false when any answerable question is optional", () => {
    expect(
      computeHideAbandonmentDefault(["f1"], [
        { formId: "f1", type: "short_text", required: false },
        { formId: "f1", type: "multiple_choice", required: true },
      ])
    ).toBe(false);
  });

  it("returns true when all answerable questions are required", () => {
    expect(
      computeHideAbandonmentDefault(["f1"], [
        { formId: "f1", type: "short_text", required: true },
        { formId: "f1", type: "multiple_choice", required: true },
        { formId: "f1", type: "section", required: false },
      ])
    ).toBe(true);
  });

  it("returns false when a form has no answerable questions", () => {
    expect(
      computeHideAbandonmentDefault(["f1"], [{ formId: "f1", type: "section", required: false }])
    ).toBe(false);
  });

  it("requires every linked form to have all answerable required", () => {
    expect(
      computeHideAbandonmentDefault(["f1", "f2"], [
        { formId: "f1", type: "short_text", required: true },
        { formId: "f2", type: "short_text", required: false },
      ])
    ).toBe(false);
  });
});
