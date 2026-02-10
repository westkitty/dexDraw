import { describe, it, expect, beforeAll } from 'vitest';
import { initTokenSecret, createBoardToken, verifyBoardToken } from '../auth/token.js';

describe('Board tokens (JWT)', () => {
  beforeAll(() => {
    initTokenSecret('test-secret-for-unit-tests-only');
  });

  it('creates and verifies a valid token', async () => {
    const token = await createBoardToken('board-1', 'user-1', 'edit');
    const payload = await verifyBoardToken(token);
    expect(payload.boardId).toBe('board-1');
    expect(payload.userId).toBe('user-1');
    expect(payload.role).toBe('edit');
  });

  it('includes expiration time', async () => {
    const token = await createBoardToken('board-1', 'user-1', 'view', 3600);
    const payload = await verifyBoardToken(token);
    expect(payload.exp).toBeDefined();
    expect(payload.iat).toBeDefined();
  });

  it('rejects a tampered token', async () => {
    const token = await createBoardToken('board-1', 'user-1', 'edit');
    const tampered = `${token.slice(0, -5)}XXXXX`;
    await expect(verifyBoardToken(tampered)).rejects.toThrow();
  });

  it('rejects an expired token', async () => {
    // Create a token with 0 TTL (expires immediately)
    const token = await createBoardToken('board-1', 'user-1', 'edit', 0);
    // Wait a brief moment to ensure expiry
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await expect(verifyBoardToken(token)).rejects.toThrow();
  });

  it('preserves role in token', async () => {
    for (const role of ['view', 'comment', 'edit'] as const) {
      const token = await createBoardToken('board-1', 'user-1', role);
      const payload = await verifyBoardToken(token);
      expect(payload.role).toBe(role);
    }
  });
});
