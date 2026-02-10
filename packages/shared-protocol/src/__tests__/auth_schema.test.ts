import { v4 as uuid } from 'uuid';
import { describe, expect, it } from 'vitest';
import { BoardRole, JoinRequest } from '../schemas/auth.js';

describe('Auth Schemas', () => {
  describe('BoardRole', () => {
    it('accepts valid roles', () => {
      expect(BoardRole.safeParse('view').success).toBe(true);
      expect(BoardRole.safeParse('comment').success).toBe(true);
      expect(BoardRole.safeParse('edit').success).toBe(true);
    });

    it('rejects invalid roles', () => {
      expect(BoardRole.safeParse('admin').success).toBe(false);
      expect(BoardRole.safeParse('').success).toBe(false);
    });
  });

  describe('JoinRequest', () => {
    it('validates a correct join request', () => {
      const validRequest = {
        type: 'join',
        roomId: 'room-123',
        token: 'some-jwt-token',
        clientId: uuid(),
        lastSeenServerSeq: 0,
        displayName: 'User',
      };
      expect(JoinRequest.safeParse(validRequest).success).toBe(true);
    });

    it('rejects invalid client ID', () => {
      const invalidRequest = {
        type: 'join',
        roomId: 'room-123',
        token: 'token',
        clientId: 'not-a-uuid',
        lastSeenServerSeq: 0,
        displayName: 'User',
      };
      const result = JoinRequest.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
