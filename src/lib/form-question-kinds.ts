export const CONTENT_BLOCK_TYPES = new Set([
  "text_block",
  "markdown_block",
  "separator",
  "image_block",
  "video_block",
  "file_download",
]);

export function acceptsAnswerValue(type: string): boolean {
  if (type === "section") return false;
  if (CONTENT_BLOCK_TYPES.has(type)) return false;
  return true;
}

export function allowsEmptyQuestionText(type: string): boolean {
  return type === "separator";
}
