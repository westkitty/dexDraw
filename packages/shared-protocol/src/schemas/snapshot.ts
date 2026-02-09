import { z } from 'zod';

export const BoardObjectSnapshot = z.object({
  objectId: z.string().uuid(),
  objectType: z.string(),
  data: z.record(z.unknown()),
  zIndex: z.number().int(),
});

export const BoardSnapshot = z.object({
  boardId: z.string(),
  serverSeq: z.number().int().nonnegative(),
  objects: z.array(BoardObjectSnapshot),
  createdAt: z.number(),
});

export type BoardObjectSnapshot = z.infer<typeof BoardObjectSnapshot>;
export type BoardSnapshot = z.infer<typeof BoardSnapshot>;
