import type { QuestionType } from "@/types";
import type { FileUploadRules } from "@/types/file-upload-rules";

export interface Question {
  id: string;
  formId: string;
  type: QuestionType;
  text: string;
  required: boolean;
  orderIndex: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  conditionQuestionId?: string;
  conditionOperator?: string;
  conditionValue?: unknown;
  sectionTitle?: string;
  sectionDescription?: string;
  helpText?: string;
  placeholder?: string;
  contentHtml?: string;
  imageUrl?: string;
  videoUrl?: string;
  imageAlt?: string;
  separatorStyle?: string;
  fileDownloadUrl?: string;
  fileDownloadLabel?: string;
  fileDownloadMime?: string;
  fileUploadRules?: FileUploadRules;
  customIcon?: string;
}
