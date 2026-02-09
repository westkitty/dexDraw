import { z } from 'zod';

export const TextCRDTPayload = z.object({
  kind: z.literal('textCRDT'),
  textObjectId: z.string().uuid(),
  update: z.string(), // base64-encoded Yjs update
  serverSeqRef: z.number().int().nonnegative(),
});

export const HybridPayload = TextCRDTPayload;

export type TextCRDTPayload = z.infer<typeof TextCRDTPayload>;
export type HybridPayload = z.infer<typeof HybridPayload>;
