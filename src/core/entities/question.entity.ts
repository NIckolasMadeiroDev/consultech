import type { QuestionType } from "@/types";

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
}
