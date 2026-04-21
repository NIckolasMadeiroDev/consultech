import { marked } from "marked";
import { sanitizeRichHtml } from "./sanitize-rich-html";

marked.setOptions({ gfm: true, breaks: true });

export function markdownToSafeHtml(source: string): string {
  const raw = marked.parse(source.trim(), { async: false }) as string;
  return sanitizeRichHtml(raw);
}
