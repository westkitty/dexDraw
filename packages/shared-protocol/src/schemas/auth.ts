import { z } from 'zod';

export const BoardRole = z.enum(['view', 'comment', 'edit']);
export type BoardRole = z.infer<typeof BoardRole>;

export const JoinRequest = z.object({
  type: z.literal('join'),
  roomId: z.string(),
  token: z.string(),
  clientId: z.string().uuid(),
  lastSeenServerSeq: z.number().int().nonnegative(),
  displayName: z.string(),
});

export const JoinResponse = z.object({
  type: z.literal('joinAck'),
  roomId: z.string(),
  clientId: z.string().uuid(),
  role: BoardRole,
  currentServerSeq: z.number().int().nonnegative(),
  users: z.array(
    z.object({
      clientId: z.string().uuid(),
      displayName: z.string(),
      color: z.string(),
    }),
  ),
});

export type JoinRequest = z.infer<typeof JoinRequest>;
export type JoinResponse = z.infer<typeof JoinResponse>;
