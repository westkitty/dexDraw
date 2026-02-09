import { z } from 'zod';

/** Strict style schema — no .passthrough() to prevent protocol/DB pollution. */
export const StyleSchema = z.object({
  strokeColor: z.string().optional(),
  fillColor: z.string().optional(),
  strokeWidth: z.number().positive().optional(),
  fontSize: z.number().positive().optional(),
  fontFamily: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export type Style = z.infer<typeof StyleSchema>;
