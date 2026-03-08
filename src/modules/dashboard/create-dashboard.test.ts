import { describe, it, expect, vi } from "vitest";
import { createDashboard } from "./create-dashboard";

describe("createDashboard", () => {
  it("deve lançar erro quando título está vazio", async () => {
    const repo = { create: vi.fn() };
    await expect(
      createDashboard(
        { title: "", formIds: ["form-1"] },
        "admin-1",
        repo as never
      )
    ).rejects.toThrow("Title required");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando formIds está vazio", async () => {
    const repo = { create: vi.fn() };
    await expect(
      createDashboard(
        { title: "Dashboard", formIds: [] },
        "admin-1",
        repo as never
      )
    ).rejects.toThrow("At least one form required");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("deve criar dashboard com dados válidos", async () => {
    const dashboard = {
      id: "dash-1",
      title: "Clima",
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      formIds: ["form-1", "form-2"],
    };
    const repo = { create: vi.fn().mockResolvedValue(dashboard) };
    const result = await createDashboard(
      { title: "Clima", formIds: ["form-1", "form-2"] },
      "admin-1",
      repo as never
    );
    expect(result).toEqual(dashboard);
    expect(repo.create).toHaveBeenCalledWith({
      title: "Clima",
      formIds: ["form-1", "form-2"],
      createdBy: "admin-1",
    });
  });
});
