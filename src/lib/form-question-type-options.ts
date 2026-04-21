export const FORM_QUESTION_TYPES = [
  "section",
  "separator",
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "checkbox",
  "scale",
  "yes_no",
  "date",
  "number",
  "text_block",
  "markdown_block",
  "image_block",
  "video_block",
  "file_download",
  "file_upload",
] as const;

export type FormQuestionTypeId = (typeof FORM_QUESTION_TYPES)[number];

export const FORM_QUESTION_TYPE_LABELS: Record<FormQuestionTypeId, string> = {
  section: "Seção",
  separator: "Separador",
  short_text: "Texto curto",
  long_text: "Texto longo",
  multiple_choice: "Múltipla escolha",
  dropdown: "Lista suspensa",
  checkbox: "Checkbox",
  scale: "Escala",
  yes_no: "Sim/Não",
  date: "Data",
  number: "Número",
  text_block: "Bloco de texto formatado",
  markdown_block: "Bloco Markdown",
  image_block: "Imagem",
  video_block: "Vídeo (YouTube/Vimeo)",
  file_download: "Download de ficheiro",
  file_upload: "Envio de ficheiro (respondente)",
};

export const FORM_QUESTION_TYPE_GROUPS = [
  {
    heading: "Estrutura",
    options: [
      { value: "section", label: FORM_QUESTION_TYPE_LABELS.section },
      { value: "separator", label: FORM_QUESTION_TYPE_LABELS.separator },
    ],
  },
  {
    heading: "Perguntas",
    options: [
      { value: "short_text", label: FORM_QUESTION_TYPE_LABELS.short_text },
      { value: "long_text", label: FORM_QUESTION_TYPE_LABELS.long_text },
      { value: "multiple_choice", label: FORM_QUESTION_TYPE_LABELS.multiple_choice },
      { value: "dropdown", label: FORM_QUESTION_TYPE_LABELS.dropdown },
      { value: "checkbox", label: FORM_QUESTION_TYPE_LABELS.checkbox },
      { value: "scale", label: FORM_QUESTION_TYPE_LABELS.scale },
      { value: "yes_no", label: FORM_QUESTION_TYPE_LABELS.yes_no },
      { value: "date", label: FORM_QUESTION_TYPE_LABELS.date },
      { value: "number", label: FORM_QUESTION_TYPE_LABELS.number },
      { value: "file_upload", label: FORM_QUESTION_TYPE_LABELS.file_upload },
    ],
  },
  {
    heading: "Blocos de conteúdo",
    options: [
      { value: "text_block", label: FORM_QUESTION_TYPE_LABELS.text_block },
      { value: "markdown_block", label: FORM_QUESTION_TYPE_LABELS.markdown_block },
      { value: "image_block", label: FORM_QUESTION_TYPE_LABELS.image_block },
      { value: "video_block", label: FORM_QUESTION_TYPE_LABELS.video_block },
      { value: "file_download", label: FORM_QUESTION_TYPE_LABELS.file_download },
    ],
  },
];
