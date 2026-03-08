import type { FormStatus } from "@/types";

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  version: number;
  slug?: string;
  allowAnonymous: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  linkStatus?: string;
}
