import type { FormStatus } from "@/types";

export interface Form {
  id: string;
  title: string;
  description?: string;
  closingMessage?: string;
  pausedMessage?: string;
  folderId?: string;
  folder?: string;
  isTemplate?: boolean;
  status: FormStatus;
  version: number;
  slug?: string;
  allowAnonymous: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  linkStatus?: string;
}
