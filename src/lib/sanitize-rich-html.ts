import DOMPurify from "isomorphic-dompurify";

const SAFE_HTML_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "code",
    "pre",
  ],
  ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeRichHtml(dirty: string): string {
  const trimmed = dirty.trim();
  if (!trimmed) return "";
  return DOMPurify.sanitize(trimmed, SAFE_HTML_CONFIG);
}
