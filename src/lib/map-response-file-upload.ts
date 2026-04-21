import type { ResponseAttachmentInput } from "@/modules/responses/response-attachment.types";

export type ResponseFileUploadApiResult = {
  url: string;
  publicUrl: string;
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
  originalFilename: string;
};

export function mapResponseFileUploadToAttachment(
  questionId: string,
  r: ResponseFileUploadApiResult
): ResponseAttachmentInput {
  return {
    questionId,
    storagePath: r.storagePath,
    publicUrl: r.publicUrl,
    sizeBytes: r.sizeBytes,
    mimeType: r.mimeType,
    originalFilename: r.originalFilename,
  };
}
