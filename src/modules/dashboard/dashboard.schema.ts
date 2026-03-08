import { z } from "zod";

export const createDashboardSchema = z.object({
  title: z.string().min(1),
  formIds: z.array(z.string().uuid()).min(1),
});

export const updateDashboardSchema = z.object({
  title: z.string().min(1).optional(),
  formIds: z.array(z.string().uuid()).min(1).optional(),
});

export type CreateDashboardInput = z.infer<typeof createDashboardSchema>;
export type UpdateDashboardInput = z.infer<typeof updateDashboardSchema>;
