import { describe, it, expect } from "vitest";
import { validateResponseAttachments } from "./validate-response-attachments";
import type { Question } from "@/core/entities";
import type { ResponseAttachmentInput } from "./response-attachment.types";

const formId = "550e8400-e29b-41d4-a716-446655440000";
const qFile = "550e8400-e29b-41d4-a716-446655440001";
const qText = "550e8400-e29b-41d4-a716-446655440002";

const baseFileQ = (id: string, required: boolean, maxFiles: number): Question =>
  ({
    id,
    formId,
    type: "file_upload",
    text: "Upload",
    required: false,
    orderIndex: 0,
    fileUploadRules: {
      maxFileBytes: 1_000_000,
      maxFiles,
      allowedExtensions: ["pdf"],
      required,
    },
  }) as Question;

describe("validateResponseAttachments", () => {
  it("aceita lista vazia quando não há perguntas obrigatórias de ficheiro", () => {
    const questions = [baseFileQ(qFile, false, 1)];
    expect(() => validateResponseAttachments(formId, questions, undefined)).not.toThrow();
    expect(() => validateResponseAttachments(formId, questions, [])).not.toThrow();
  });

  it("rejeita quando falta anexo obrigatório", () => {
    const questions = [baseFileQ(qFile, true, 1)];
    expect(() => validateResponseAttachments(formId, questions, undefined)).toThrow("Attachment required");
  });

  it("aceita anexo com prefixo e questionId corretos", () => {
    const questions = [baseFileQ(qFile, false, 1)];
    const att: ResponseAttachmentInput[] = [
      {
        questionId: qFile,
        storagePath: `responses/${formId}/${qFile}/x.pdf`,
        publicUrl: "https://x.test/a.pdf",
        sizeBytes: 10,
        mimeType: "application/pdf",
        originalFilename: "a.pdf",
      },
    ];
    expect(() => validateResponseAttachments(formId, questions, att)).not.toThrow();
  });

  it("rejeita questionId que não é file_upload", () => {
    const questions: Question[] = [
      {
        id: qText,
        formId,
        type: "short_text",
        text: "T",
        required: false,
        orderIndex: 0,
      },
    ];
    const att: ResponseAttachmentInput[] = [
      {
        questionId: qText,
        storagePath: `responses/${formId}/${qText}/x.pdf`,
        publicUrl: "https://x.test/a.pdf",
        sizeBytes: 10,
        mimeType: "application/pdf",
        originalFilename: "a.pdf",
      },
    ];
    expect(() => validateResponseAttachments(formId, questions, att)).toThrow("Invalid attachment question");
  });

  it("rejeita demasiados anexos por pergunta", () => {
    const questions = [baseFileQ(qFile, false, 1)];
    const att: ResponseAttachmentInput[] = [
      {
        questionId: qFile,
        storagePath: `responses/${formId}/${qFile}/a.pdf`,
        publicUrl: "https://x.test/a.pdf",
        sizeBytes: 10,
        mimeType: "application/pdf",
        originalFilename: "a.pdf",
      },
      {
        questionId: qFile,
        storagePath: `responses/${formId}/${qFile}/b.pdf`,
        publicUrl: "https://x.test/b.pdf",
        sizeBytes: 10,
        mimeType: "application/pdf",
        originalFilename: "b.pdf",
      },
    ];
    expect(() => validateResponseAttachments(formId, questions, att)).toThrow("Too many attachments");
  });
});
