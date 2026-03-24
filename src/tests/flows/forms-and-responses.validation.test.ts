/**
 * Testes de validação dos fluxos principais do sistema.
 * Garante que criar formulário → editar → duplicar → arquivar → enviar resposta
 * está em conformidade com as regras de negócio e API.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createFormPost, GET as getFormsList } from "@/app/api/forms/route";
import { GET as getFormById, PATCH as updateFormPatch } from "@/app/api/forms/[id]/route";
import { POST as duplicatePost } from "@/app/api/forms/[id]/duplicate/route";
import { POST as archivePost } from "@/app/api/forms/[id]/archive/route";
import { POST as submitResponsePost } from "@/app/api/responses/submit/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
  getFormRevisionRepository: vi.fn(),
  getRespondentRepository: vi.fn(),
  getResponseRepository: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({
  getCreatedBy: vi.fn().mockResolvedValue("user-flow"),
  getSession: vi.fn().mockResolvedValue({ id: "user-flow" }),
}));

import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
  getFormRevisionRepository,
  getRespondentRepository,
  getResponseRepository,
} from "@/infrastructure/database/repositories";

describe("Fluxo: formulários e respostas", () => {
  const formId = "550e8400-e29b-41d4-a716-446655440001";
  const formIdCopy = "550e8400-e29b-41d4-a716-446655440002";
  const questionId = "550e8400-e29b-41d4-a716-446655440003";
  const respondentId = "resp-flow-1";
  const responseId = "resp-id-1";

  beforeEach(() => {
    vi.mocked(getAuditLogRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
    vi.mocked(getFormRevisionRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
  });

  describe("1. Criar formulário com opções e escala", () => {
    it("POST /api/forms aceita multiple_choice com options e scale com min/max", async () => {
      vi.mocked(getFormRepository).mockReturnValue({
        create: vi.fn().mockResolvedValue({
          id: formId,
          title: "Pesquisa Fluxo",
          description: "Desc",
          status: "draft",
          version: 1,
          createdBy: "user-flow",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as never);
      vi.mocked(getQuestionRepository).mockReturnValue({
        createMany: vi.fn().mockResolvedValue([
          { id: questionId, formId, type: "multiple_choice", text: "Escolha", required: true, orderIndex: 0, options: ["A", "B", "C"] },
          { id: "q2", formId, type: "scale", text: "Nota 0-5", required: true, orderIndex: 1, scaleMin: 0, scaleMax: 5 },
        ]),
      } as never);
      const req = new NextRequest("http://localhost/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Pesquisa Fluxo",
          description: "Desc",
          slug: "fluxo-teste",
          allowAnonymous: false,
          questions: [
            { type: "multiple_choice", text: "Escolha", required: true, orderIndex: 0, options: ["A", "B", "C"] },
            { type: "scale", text: "Nota 0-5", required: true, orderIndex: 1, scaleMin: 0, scaleMax: 5 },
          ],
        }),
      });
      const res = await createFormPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(formId);
      expect(json.title).toBe("Pesquisa Fluxo");
    });
  });

  describe("2. Listar e obter formulário", () => {
    it("GET /api/forms retorna lista; GET /api/forms/[id] retorna form com questions", async () => {
      const form = {
        id: formId,
        title: "Pesquisa Fluxo",
        description: "Desc",
        status: "draft",
        version: 1,
        createdBy: "user-flow",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const questions = [
        { id: questionId, formId, type: "multiple_choice", text: "Escolha", required: true, orderIndex: 0, options: ["A", "B"] },
        { id: "q2", formId, type: "scale", text: "Nota", required: true, orderIndex: 1, scaleMin: 0, scaleMax: 5 },
      ];
      vi.mocked(getFormRepository).mockReturnValue({
        findByCreatedBy: vi.fn().mockResolvedValue([{ ...form, status: form.status, slug: null }]),
        findById: vi.fn().mockResolvedValue(form),
      } as never);
      vi.mocked(getQuestionRepository).mockReturnValue({
        findByFormId: vi.fn().mockResolvedValue(questions),
      } as never);
      const listRes = await getFormsList(new NextRequest("http://localhost/api/forms"));
      expect(listRes.status).toBe(200);
      const list = await listRes.json();
      expect(list.some((f: { id: string }) => f.id === formId)).toBe(true);
      const getRes = await getFormById(new NextRequest(`http://localhost/api/forms/${formId}`), { params: { id: formId } });
      expect(getRes.status).toBe(200);
      const formJson = await getRes.json();
      expect(formJson.questions).toHaveLength(2);
      expect(formJson.questions[0].options).toEqual(["A", "B"]);
      expect(formJson.questions[1].scaleMin).toBe(0);
      expect(formJson.questions[1].scaleMax).toBe(5);
    });
  });

  describe("3. Atualizar formulário", () => {
    it("PATCH /api/forms/[id] atualiza título e status", async () => {
      const updated = {
        id: formId,
        title: "Pesquisa Atualizada",
        description: "Desc",
        status: "active" as const,
        version: 1,
        createdBy: "user-flow",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const before = {
        id: formId,
        title: "Antigo",
        description: "Desc",
        status: "draft" as const,
        version: 1,
        isTemplate: false,
        allowAnonymous: false,
        createdBy: "user-flow",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const afterV2 = { ...updated, version: 2 };
      let findN = 0;
      vi.mocked(getFormRepository).mockReturnValue({
        findById: vi.fn(async () => {
          findN += 1;
          if (findN === 1) return before;
          if (findN === 2) return updated;
          return afterV2;
        }),
        update: vi.fn().mockResolvedValue(updated),
        setVersion: vi.fn().mockResolvedValue(afterV2),
      } as never);
      vi.mocked(getQuestionRepository).mockReturnValue({
        findByFormId: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn(),
        createMany: vi.fn(),
        deleteManyIds: vi.fn(),
      } as never);
      const req = new NextRequest(`http://localhost/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Pesquisa Atualizada", status: "active" }),
      });
      const res = await updateFormPatch(req, { params: { id: formId } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.title).toBe("Pesquisa Atualizada");
      expect(json.status).toBe("active");
    });
  });

  describe("4. Duplicar formulário", () => {
    it("POST /api/forms/[id]/duplicate retorna novo form em rascunho", async () => {
      vi.mocked(getFormRepository).mockReturnValue({
        findById: vi.fn().mockResolvedValue({ id: formId, title: "Original" }),
        duplicate: vi.fn().mockResolvedValue({
          id: formIdCopy,
          title: "Original (cópia)",
          description: null,
          status: "draft",
          version: 1,
          createdBy: "user-flow",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as never);
      vi.mocked(getQuestionRepository).mockReturnValue({
        findByFormId: vi.fn().mockResolvedValue([{ id: questionId, formId, type: "short_text", text: "P1", required: false, orderIndex: 0 }]),
        createMany: vi.fn().mockImplementation((rows: Array<{ formId: string }>) =>
          Promise.resolve(
            rows.map((r, i) => ({
              id: `new-q-${i}`,
              formId: r.formId,
              type: "short_text" as const,
              text: "P1",
              required: false,
              orderIndex: 0,
            }))
          )
        ),
        updateMany: vi.fn().mockResolvedValue([]),
      } as never);
      const req = new NextRequest(`http://localhost/api/forms/${formId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await duplicatePost(req, { params: { id: formId } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(formIdCopy);
      expect(json.title).toContain("cópia");
      expect(json.status).toBe("draft");
    });
  });

  describe("5. Arquivar formulário", () => {
    it("POST /api/forms/[id]/archive retorna status archived", async () => {
      vi.mocked(getFormRepository).mockReturnValue({
        findById: vi.fn().mockResolvedValue({ id: formId }),
        update: vi.fn().mockResolvedValue({
          id: formId,
          title: "F",
          status: "archived",
          version: 1,
          createdBy: "user-flow",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as never);
      const req = new NextRequest(`http://localhost/api/forms/${formId}/archive`, { method: "POST" });
      const res = await archivePost(req, { params: { id: formId } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("archived");
    });
  });

  describe("6. Enviar resposta", () => {
    it("POST /api/responses/submit aceita payload com formId, respondent e answers", async () => {
      vi.mocked(getFormRepository).mockReturnValue({
        findById: vi.fn().mockResolvedValue({
          id: formId,
          status: "active",
          allowAnonymous: false,
        }),
      } as never);
      vi.mocked(getRespondentRepository).mockReturnValue({
        create: vi.fn().mockResolvedValue({
          id: respondentId,
          name: "João",
          email: "joao@test.com",
          createdAt: new Date(),
        }),
      } as never);
      vi.mocked(getResponseRepository).mockReturnValue({
        create: vi.fn().mockResolvedValue({
          id: responseId,
          formId,
          respondentId,
          submittedAt: new Date(),
        }),
      } as never);
      const req = new NextRequest("http://localhost/api/responses/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          respondent: { name: "João", email: "joao@test.com" },
          answers: [{ questionId, value: "A" }],
        }),
      });
      const res = await submitResponsePost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(responseId);
      expect(json.formId).toBe(formId);
    });

    it("POST /api/responses/submit rejeita formId inválido (UUID)", async () => {
      const req = new NextRequest("http://localhost/api/responses/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: "not-uuid",
          respondent: { name: "A", email: "a@b.com" },
          answers: [{ questionId, value: "x" }],
        }),
      });
      const res = await submitResponsePost(req);
      expect(res.status).toBe(400);
    });
  });
});
