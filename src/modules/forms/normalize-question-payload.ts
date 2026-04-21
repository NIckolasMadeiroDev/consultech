import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import type { QuestionSchemaInput } from "./form.schema";

export function normalizeQuestionForPersistence(q: QuestionSchemaInput): QuestionSchemaInput {
  if (q.type !== "text_block") return q;
  const html = q.contentHtml?.trim();
  if (!html) return q;
  return { ...q, contentHtml: sanitizeRichHtml(html) };
}
