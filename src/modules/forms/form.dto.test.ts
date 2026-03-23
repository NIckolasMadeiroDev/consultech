import { describe, it, expect } from "vitest";
import { formDTO, formListDTO } from "./form.dto";

describe("form.dto", () => {
  const form = {
    id: "f1",
    title: "Form 1",
    description: "Desc",
    status: "draft" as const,
    version: 1,
    slug: "form-1",
    allowAnonymous: false,
    createdBy: "admin-1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-02"),
  };

  it("formDTO retorna objeto com campos esperados", () => {
    const dto = formDTO(form);
    expect(dto.id).toBe("f1");
    expect(dto.title).toBe("Form 1");
    expect(dto.description).toBe("Desc");
    expect(dto.status).toBe("draft");
    expect(dto.version).toBe(1);
    expect(dto.slug).toBe("form-1");
    expect(dto.allowAnonymous).toBe(false);
    expect(dto.createdBy).toBe("admin-1");
    expect(dto.createdAt).toEqual(form.createdAt);
    expect(dto.updatedAt).toEqual(form.updatedAt);
  });

  it("formListDTO retorna id, title, status, slug, folder, folderId, isTemplate, createdAt", () => {
    const dto = formListDTO(form);
    expect(Object.keys(dto).sort()).toEqual(
      ["createdAt", "folder", "folderId", "id", "isTemplate", "slug", "status", "title"].sort()
    );
    expect(dto.id).toBe("f1");
    expect(dto.title).toBe("Form 1");
    expect(dto.status).toBe("draft");
    expect(dto.slug).toBe("form-1");
    expect(dto.createdAt).toEqual(form.createdAt);
  });
});
