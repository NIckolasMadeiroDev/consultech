import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1).max(120),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
