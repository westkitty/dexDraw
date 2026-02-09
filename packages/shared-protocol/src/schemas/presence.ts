import { z } from 'zod';

export const CursorPayload = z.object({
  kind: z.literal('cursor'),
  x: z.number(),
  y: z.number(),
  name: z.string(),
});

export const LaserPayload = z.object({
  kind: z.literal('laser'),
  x: z.number(),
  y: z.number(),
  active: z.boolean(),
});

export const EphemeralPayload = z.discriminatedUnion('kind', [CursorPayload, LaserPayload]);

export type CursorPayload = z.infer<typeof CursorPayload>;
export type LaserPayload = z.infer<typeof LaserPayload>;
export type EphemeralPayload = z.infer<typeof EphemeralPayload>;
