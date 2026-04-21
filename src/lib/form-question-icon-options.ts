export const FORM_QUESTION_ICON_NAMES = [
  "CircleHelp",
  "Type",
  "AlignLeft",
  "ListChecks",
  "CheckSquare",
  "ChevronDown",
  "Calendar",
  "Hash",
  "ToggleLeft",
  "Image",
  "Video",
  "Minus",
  "Download",
  "Upload",
  "BookOpen",
  "Layers",
  "Sparkles",
  "Mail",
  "User",
  "Building2",
  "Star",
  "ClipboardList",
  "PenLine",
] as const;

export type FormQuestionIconName = (typeof FORM_QUESTION_ICON_NAMES)[number];

const DEFAULT_BY_TYPE: Record<string, FormQuestionIconName> = {
  short_text: "Type",
  long_text: "AlignLeft",
  multiple_choice: "ListChecks",
  dropdown: "ChevronDown",
  checkbox: "CheckSquare",
  scale: "Star",
  yes_no: "ToggleLeft",
  date: "Calendar",
  number: "Hash",
  section: "Layers",
  text_block: "BookOpen",
  markdown_block: "PenLine",
  separator: "Minus",
  image_block: "Image",
  video_block: "Video",
  file_download: "Download",
  file_upload: "Upload",
};

export function defaultQuestionIconForType(questionType: string): FormQuestionIconName {
  return DEFAULT_BY_TYPE[questionType] ?? "CircleHelp";
}
