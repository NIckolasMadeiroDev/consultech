import { describe, it, expect } from "vitest";
import { createDashboardSchema } from "./dashboard.schema";

describe("createDashboardSchema", () => {
  it("valida payload com title e formIds", () => {
    const result = createDashboardSchema.parse({
      title: "Dashboard Clima",
      formIds: ["550e8400-e29b-41d4-a716-446655440000"],
    });
    expect(result.title).toBe("Dashboard Clima");
    expect(result.formIds).toHaveLength(1);
    expect(result.formIds[0]).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejeita title vazio", () => {
    expect(() =>
      createDashboardSchema.parse({
        title: "",
        formIds: ["550e8400-e29b-41d4-a716-446655440000"],
      })
    ).toThrow();
  });

  it("rejeita formIds vazio", () => {
    expect(() =>
      createDashboardSchema.parse({
        title: "Dashboard",
        formIds: [],
      })
    ).toThrow();
  });
});
